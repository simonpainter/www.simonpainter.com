---

title: "DNS as an API Proxy: A Pokemon Type Lookup Example"
authors: simonpainter
tags:
  - dns
  - programming
  - educational
  - python
date: 2026-01-16

---

Yesterday I saw a post, now removed, on [Reddit](https://www.reddit.com/r/networking/comments/1qdg95z/) that revealed that ESET uses DNS queries to do [MAC address OUI lookups](https://www.wireshark.org/tools/oui-lookup.html). This is quite smart because it allows a client to avoid maintaining a local copy of the OUI database and also means that the databases can be queried without having to have direct or proxied http access to an external API endpoint.
<!--truncate-->

## How does it work?

The lookup is for a text record (TXT) in DNS for a domain constructed with the first three bytes of the MAC Address, which make up the Organizationally Unique Identifier (OUI), and `a.o.e5.sk`. For example the MAC address `00:1A:2B:3C:4D:5E` would result in a DNS TXT query for `00-1A-2B.a.o.e5.sk`. The dig command `dig TXT 00-1A-2B.a.o.e5.sk` returns the following response:

```bash
;; ANSWER SECTION:
00-1A-2B.a.o.e5.sk. 120 IN TXT "ESET-OUI:Ayecom Technology Co., Ltd."
```

I thought this was a clever use of DNS because it avoids the need for HTTP requests but also highlights how flexible DNS can be. It also highlights the fact that DNS is often overlooked as a route for getting data in and out of a network and can be used as a cover channel for command and control traffic and data exfiltration.

## Can I have a go?

This also makes doing OUI lookups very easy with python. Here's a simple example of how to do this using the [dnspython](http://www.dnspython.org/) library:

```python
import re, dns.resolver
OUI_REGEX = re.compile(r'^(?P<oui>([0-9A-Fa-f]{2}[:-]){2}([0-9A-Fa-f]{2}))')
def lookup_oui(oui):
    match = OUI_REGEX.match(oui)
    normalized_oui = match.group('oui').upper().replace(':', '-')
    lookup_domain = f"{normalized_oui}.a.o.e5.sk"
    return dns.resolver.resolve(lookup_domain,"TXT").response.answer
```

## Hmm, interesting

So that got me thinking - there are a bunch of fun free APIs that could be exposed over DNS in this way, so I wrote a really simple DNS API proxy server in python which allows you to find out the type of a given pokemon using the [PokeAPI](https://pokeapi.co/). The server listens for DNS TXT queries for domains of the form `<pokemon-name>.pokemon.api2dns.simonpainter.com` and responds with the pokemon type(s) as a TXT record. Here's the [full gist](https://gist.github.com/simonpainter/748995a1a5a3feff830573518b3a0352).

The important bits are this simple function that grabs the pokemon type from the PokeAPI:

```python
def get_pokemon_type(pokemon_name: str) -> str | None:
    """Fetch the primary type of a Pokemon from the PokeAPI.

    Args:
        pokemon_name: The name of the Pokemon to look up.

    Returns:
        The primary type name, or None if the Pokemon is not found.
    """
    response = requests.get(f"{API_URL}/pokemon/{pokemon_name.lower()}")
    if response.status_code == 200:
        types = response.json().get("types", [])
        if types:
            return types[0]["type"]["name"]
    return None
```

And this bit that that parses the incoming DNS request to extract the pokemon name and call the above function:

```python
    def parse_dns_request(self, qname: str, qtype: str) -> str | None:
        """Parse a DNS request and return the response data if applicable.

        Args:
            qname: The query name from the DNS request.
            qtype: The query type (e.g., 'TXT', 'A').

        Returns:
            The Pokemon type if this is a valid Pokemon query, otherwise None.
        """
        if qtype != "TXT":
            return None

        parts = qname.rstrip(".").split(".")
        if len(parts) >= 5 and parts[-4:] == DNS_DOMAIN_SUFFIX:
            pokemon_name = parts[-5]
            return get_pokemon_type(pokemon_name)
        return None

```

There's no error handling and it's a really simple Friday night toy example. I put it on a small Azure VM with a public IP and set up the NS records to point to it so I could test it out and then immediately took it all down because the world doesn't need this sort of thing in production!

```bash
;; QUESTION SECTION:
;mewtwo.pokemon.api2dns.simonpainter.com. IN TXT

;; ANSWER SECTION:
mewtwo.pokemon.api2dns.simonpainter.com. 300 IN TXT "psychic"
```

## But why, Simon?

So what's the point? Well we all have our own reasons for doing things but in this case it was a simple demonstration of how ridiculously easy it is to repurpose DNS for other purposes such as data exfiltration or command and control.

That's the thing about DNS - it's the quiet protocol that nobody watches. Most firewalls wave it through without a second glance. Most security teams focus on HTTP traffic while DNS sits there, resolving away, moving data in plain sight. If you're not logging DNS queries, inspecting TXT record payloads, or using a DNS firewall to block suspicious domains, you've got a blind spot. And if a bored network engineer can build a Pokemon type checker over DNS in a few minutes on a Friday night, imagine what a motivated attacker is building right now.
