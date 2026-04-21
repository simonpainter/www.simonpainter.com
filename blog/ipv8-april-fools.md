---

title: "IPv8: a late and confused April Fool"
authors: simonpainter
tags:
  - networks
  - ipv6
  - opinion
  - educational
date: 2026-04-21

---

There's a [draft Internet-Draft floating around](https://www.ietf.org/archive/id/draft-thain-ipv8-00.html) called "IPv8" by Jamie Thain. It was published in April 2026 and reads like a list of every networking buzzword bingo square you can imagine, stapled together with a straight face. I read it twice to make sure I wasn't missing the joke. I don't think I was. So either it's an April Fool that ran a couple of weeks late, or somebody is genuinely proposing it. Either way, it deserves a careful kicking.

Let me walk through why.

<!-- truncate -->

## The name is wrong before you read a word

The IP version field in the header is four bits wide. IANA keeps a registry of which values mean what. Version 4 is IPv4. Version 6 is IPv6. The numbers in between aren't free — version 5 was [ST (Stream Protocol)](https://www.rfc-editor.org/rfc/rfc1190), and 7, 8 and 9 were all assigned during the great "what comes after IPv4" debate of the early 1990s. Version 8 specifically was [PIP, Paul Francis's "P Internet Protocol"](https://datatracker.ietf.org/doc/html/rfc1621), one of the candidates that lost to what became IPv6.

If you're going to propose a successor to IPv4, the very first thing you do is open the [IANA IP version registry](https://www.iana.org/assignments/version-numbers/version-numbers.xhtml) and pick a number that isn't already taken. Calling it "IPv8" tells me the author didn't bother. That's not a great start for a document that wants to redefine the internet.

## "100% backward compatible" with a brand new header

The abstract claims the suite is "100% backward compatible" and that "no existing device, application, or network requires modification". Section 5 then introduces a new IPv8 packet header carrying a 64-bit address.

These two statements can't both be true.

An IPv4 router or NIC looks at the first four bits of every packet. If it sees `0100` it knows this is IPv4 and parses the rest of the header by the IPv4 rules. If it sees anything else, it drops the packet or punts it to slow-path software. That decision is baked into ASIC silicon on every modern switch and router. You can't ship a firmware update that teaches a fixed-function pipeline to parse a longer header and route on a 64-bit destination. The whole point of merchant silicon like Broadcom Tomahawk or Cisco Silicon One is that the pipeline is fixed for line-rate forwarding.

The draft's escape hatch is "an IPv8 address with `r.r.r.r = 0.0.0.0` is an IPv4 address". That's just saying "if you set the new bits to zero it looks like IPv4". Sure. But the moment you set them to anything else, you've got a packet that no existing forwarding plane can route. You haven't avoided a flag day; you've smeared it across every silicon refresh cycle for the next decade.

This is exactly the problem IPv6 has been wrestling with for 25 years, and the draft waves it away in a sentence.

## Number choices that invite confusion

To be fair to the draft, most of the "reserved" ranges live in the new 32-bit `r.r.r.r` prefix field, not the IPv4-equivalent `n.n.n.n` host field. So `r.r.r.r = 127.x.x.x` for "internal zone prefix" doesn't actually collide with `127.0.0.1` loopback — they're in different namespaces. Same for the `100.0.0.0/8` RINE prefix. Technically these are just labels in a fresh address space.

That said, the choice of numbers is gratuitously confusing. Pick `127` and every operator who's ever typed `ping 127.0.0.1` will read "internal zone" as "loopback". Pick `100` and the same thing happens with CGN. There's a 32-bit space to choose from, so why pick the two values most likely to mislead a human reading a routing table? An IPv4 successor should make life easier for operators, not seed a generation of "wait, which 127 is this?" tickets.

The interior link convention is the one that does cause a real collision. Section 3.10 reserves `222.0.0.0/8` in the `n.n.n.n` field, not `r.r.r.r`. The host part has "identical semantics to IPv4", so this is the same `222.0.0.0/8` that's [allocated to APNIC](https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml) and contains live production prefixes today. You can't quietly reserve other people's allocated address space for router-to-router link addressing and call it a convention.

## "One entry per ASN" is wishful thinking

The draft brags that the global routing table is "structurally bounded at one entry per ASN" and enforces a /16 minimum prefix on inter-AS advertisements.

The current BGP table sits north of 900,000 prefixes for a reason. Operators deaggregate to do traffic engineering. They advertise more specifics for DDoS scrubbing, anycast steering, partial transit, multi-homing with provider independence, and to influence inbound path selection. Banning more specifics doesn't make those needs evaporate. It pushes them into other layers — tunnels, MPLS, application-level steering — and the operational complexity goes up, not down.

There's also a simple counting problem. The draft allocates each ASN exactly 2^32 host addresses. A small business that needs a handful of public services gets the same 4.3 billion as Google. Every household with an IPv8-capable router would presumably need an ASN to be reachable, because without one your `r.r.r.r` is `0.0.0.0` and you're stuck on IPv4. So either the address plan is wildly wasteful, or most end users aren't first-class citizens. Pick one.

## The Zone Server is a single point of catastrophe

The "Zone Server" is the heart of the proposal. It runs DHCP, DNS, NTP, syslog, OAuth caching, route validation, ACL enforcement and IPv4 translation. One box. Or technically a paired active/active box.

The whole reason DHCP, DNS and NTP evolved as separate protocols with separate daemons is operational resilience. If your DNS resolver goes down, your DHCP leases keep working. If your NTP source drifts, your authentication still validates. The Zone Server collapses all of those failure domains into one.

It gets worse. Section 1.4 says "every outbound connection must have a corresponding DNS8 lookup — no DNS lookup means no XLATE8 state table entry means the connection is blocked." So if your Zone Server hiccups, every device on the network loses internet access until the cache catches up. The same box also issues OAuth tokens that gate the NIC firmware itself. Lose the Zone Server and your network interfaces stop forwarding.

This isn't defence in depth. It's a single keystone you're inviting attackers and outages to remove.

## OAuth tokens enforced in NIC firmware

Section 1.3 says every manageable element is authorised via OAuth2 JWT tokens, and Section 17.5 says NIC firmware enforces rate limits "that cannot be overridden by software". The implication across the draft is that NIC silicon parses JWTs.

JWTs have a long and embarrassing security history — the [`alg: none` attack](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/), key confusion between RSA and HMAC, and a steady drip of library bugs. Putting a JWT validator in NIC firmware means every NIC vendor reimplements a JWT parser in C or microcode, and every CVE in that parser is a hardware refresh. Software JWT bugs are bad enough. Silicon JWT bugs would be career-ending.

And the rate limits themselves are absurd. Ten broadcasts per second is fine until you remember that ARP, mDNS, SSDP and DHCP all happily exceed that on a busy LAN. One hundred packets per second for an authenticated user wouldn't sustain a single video call, let alone a backup or a software update. A 1080p Teams call is around 30 frames per second of video plus audio packets — you're already over budget before you've sent a keystroke.

## Cost Factor is EIGRP's ghost

Section 1.6 introduces the Cost Factor — a 32-bit composite metric combining round-trip time, loss, congestion window state, link capacity, "economic policy" and a "geographic distance physics floor" — accumulated across BGP hops and used by every router independently.

This is EIGRP's composite metric scaled up to the global internet. EIGRP's metric works inside a single administrative domain because one operator controls all the inputs and weights. Across AS boundaries you have nothing of the sort. My measurement of RTT to your router is not your measurement of RTT to mine. "Economic policy" isn't comparable between ASes — my cost to send traffic to Cogent is not your cost. Aggregating these values hop-by-hop and expecting convergence without coordination is the kind of thing that sounds fine on a slide and falls apart the moment two ASes disagree about which path is "better".

We already have route origin validation. It's called [RPKI](https://www.rfc-editor.org/rfc/rfc6480), it has real deployment, and it doesn't require reinventing WHOIS as "WHOIS8".

## Reinventing things that already exist

A non-exhaustive list of wheels the draft re-rounds:

- **DHCP8 returning every service endpoint in one response** — DHCPv4 already has options for DNS (6), NTP (42), syslog (7), domain name (15), and dozens more. You can hand a client every service it needs in one DHCP Offer today.
- **A8 record returning an even/odd pair for load balancing** — DNS round-robin and multiple A records have done this since the 1990s.
- **Two default gateways, even/odd VLAN split** — that's HSRP, VRRP and GLBP with extra steps.
- **8to4 tunnelling over HTTPS** — [6to4 (RFC 3056)](https://www.rfc-editor.org/rfc/rfc3056) tried automatic tunnelling and it was a deployment disaster. Renaming it doesn't fix the asymmetric routing and unreachable relay problems that killed it.
- **PVRST mandatory** — PVRST is a Cisco proprietary extension. Mandating a single vendor's protocol in an IETF standard is unusual to put it politely.
- **WHOIS8 as a route validation registry** — RPKI, ROAs and ASPA exist and are deploying.

## ASN sprawl

Today's BGP table has roughly 75,000 active ASNs out of 4.3 billion possible. The draft assumes every entity that wants a public presence on IPv8 holds an ASN. That's a fundamental change to who can be a first-class participant on the internet. RIRs would need to issue ASNs the way they currently issue IP allocations, and the ASN allocation process would need to scale by orders of magnitude.

The draft doesn't say how. It just assumes ASNs are free.

## Why I think it's a joke

The companion drafts give it away. There are ten of them. WiFi8. SNMPv8. Update8. Wifi8 in particular — there is already [Wi-Fi 8 (802.11bn)](https://www.ieee802.org/11/Reports/tgbn_update.htm) in development by the IEEE, and it has nothing to do with IP. Calling your wireless protocol "WiFi8" because the rest of your suite has an 8 in it is the giveaway move of someone enjoying themselves rather than someone proposing a serious architecture.

Also: "NIC certification". "Update8 with rollback prevention enforced in NIC hardware". "PVRST mandatory". A spec that mandates a paired active/active appliance, calls it a Zone Server, and requires every NIC on earth to validate JWTs before forwarding a frame. It reads like someone took every operational frustration of the last twenty years and answered each one with "what if we just made it the protocol's problem".

If it is a joke, it's a good one and I tip my hat. If it isn't, I'd gently suggest reading [RFC 1925](https://www.rfc-editor.org/rfc/rfc1925) — particularly truths 5, 6 and 11 — before submitting an `-01`.

## What a serious successor would have to do

For completeness, here's what a real IPv4 successor proposal needs to address that this draft doesn't:

- A clear story for hardware forwarding, including which silicon generations can support it and which can't.
- A migration path that doesn't require every CGNAT and every loopback handler on the planet to change behaviour.
- A version field choice that respects the existing IANA registry.
- Address allocation policy that doesn't assume every participant holds an ASN.
- A failure model where the loss of any single management plane component doesn't take the data plane with it.
- An honest acknowledgement of why IPv6 deployment has been slow, rather than dismissing it as "commercially unacceptable".

IPv6 has its critics, and some of the criticisms are fair. But it's also worth being honest about where IPv6 actually is. [Google's public statistics](https://www.google.com/intl/en/ipv6/statistics.html) show roughly half of all traffic to Google reaching them over IPv6 today, with most of that growth happening in the last decade. The "IPv6 has failed" narrative the draft leans on doesn't really survive a glance at the graph.

The reason adoption looks slow from a Western enterprise desk is mostly a privilege story rather than a technology one — I went into the detail in [an earlier post on the global IPv4 landscape](ipv4-global-landscape.md). Countries that built their internet before the RIRs ran out of v4 are sitting on huge legacy allocations and have little day-to-day pressure to move. Countries that came online later, particularly in Asia, deployed IPv6 because they had no choice, and they're now well past 50% IPv6 in some markets. The protocol works. The deployment friction is commercial and political, not architectural.

The answer to "IPv6 is hard to deploy in legacy Western networks" is not "let's design something that requires replacing every NIC, every router ASIC, every DHCP server, and every RIR allocation policy, and call it backward compatible".

I'll be watching for `draft-thain-ipv8-01` with interest. Mostly to see whether it lands on the first of April next year.
