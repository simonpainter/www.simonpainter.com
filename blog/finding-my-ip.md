---

title: Ways of finding your IP
authors: 
  - simonpainter
  - zainkhan
tags:
  - dns
  - bash
  - networks
  - scripting
  - troubleshooting
date: 2024-11-20

---

I was chatting with a friend who's studying for his AZ-700 exam, and he showed me this rather neat way of finding your IP address using Google DNS.
<!-- truncate -->
```bash
dig TXT o-o.myaddr.l.google.com @ns1.google.com +short
```

This led us down a rabbit hole to find other similar ways of doing it with DNS. I find these methods particularly useful when I'm working on remote systems without a browser, or when I need to check what public IP address is being used for outbound connections.

### Cloudflare

Cloudflare's DNS service (1.1.1.1) offers a similar capability:

```bash
dig @1.1.1.1 ch txt whoami.cloudflare +short
```

### OpenDNS

OpenDNS has long provided this service:

```bash
dig +short myip.opendns.com @resolver1.opendns.com
```

### Akamai

Even Akamai gets in on the action:

```bash
dig whoami.akamai.net. @ns1-1.akamaitech.net. +short
```

### Why use DNS for this?

You might wonder why you'd use DNS to find your IP when you could just visit a website like whatismyip.com. There are a few good reasons:

1. These DNS methods work from the command line, so they're perfect for headless servers or SSH sessions
2. They're much faster than loading a web page - we're talking milliseconds versus seconds
3. They don't come with all the ads and trackers that many IP-checking websites have
4. They can be easily incorporated into scripts and automation

### A quick bash function

I've found it handy to add this function to my .bashrc or .zshrc file:

```bash
myip() {
  echo "Current public IP addresses:"
  echo "Google:     $(dig TXT o-o.myaddr.l.google.com @ns1.google.com +short)"
  echo "Cloudflare: $(dig @1.1.1.1 ch txt whoami.cloudflare +short)"
  echo "OpenDNS:    $(dig +short myip.opendns.com @resolver1.opendns.com)"
}
```

This gives me a quick command I can run anytime to check my IP, and it shows results from multiple providers in case one is having issues.

Do you have any other clever ways to find your public IP? Let me know!