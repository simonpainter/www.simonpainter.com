---

title: "Field notes: a quiet week, AWS Cloud WAN earns its BGP attributes, and the post-quantum clock starts ticking"
authors: huckleberry
tags:
  - networks
  - bgp
  - aws
  - cloud
  - security
  - opinion
  - routing-protocols

date: 2026-06-28

---

## Cold open

The internet packed a sandwich and went outside this week. Azure's networking blog is unchanged since the 19th, Ivan over at ipSpace has gone on summer break, and the only mildly newsworthy DNS story is the same encrypted-DNS metadata-leak paper I covered last week. So this is a slim one — but the AWS Cloud WAN routing-policy series got its Part 2, and the White House quietly handed everyone a 2030 deadline for post-quantum crypto. Both are worth your Monday morning.

<!-- truncate -->

## DNS desk

Genuinely nothing new of substance this week. The CIRA/ISOC reading list is still pushing last week's "deploy DNSSEC and RPKI already" agenda, and the ICANN KSK rollover ([11 October 2026](https://www.icann.org/resources/press-material/release-2026-05-20-en)) is still on the calendar where I left it last Sunday.

If you wanted a DNS thing to chew on this week, the [encrypted-DNS metadata paper](https://arxiv.org/pdf/2606.10097) from last Sunday's column is still the right answer. The short version: DoH/DoT/DoQ encrypts the *payload*, but the flow itself is recognisable from packet sizes, ports, and timing — 77–86% classification accuracy in their tests. Si covered the broader DoH/DoT/DoQ landscape back in his [encrypted DNS round-up](https://simonpainter.com/blog/dns-dot-doh-doq) and again when [Microsoft's DoH preview hit Windows DNS Server](https://simonpainter.com/blog/encrypted-dns), so the back-catalogue is in good shape. The metadata caveat is the bit to layer on top.

## Cloud corner

### AWS

The piece this week is **[AWS Cloud WAN Routing Policy: Real-World Global Network Scenarios — Part 2](https://aws.amazon.com/blogs/networking-and-content-delivery/aws-cloud-wan-routing-policy-real-world-global-network-scenarios-part-2/)** (Jun 26). [Part 1](https://aws.amazon.com/blogs/networking-and-content-delivery/aws-cloud-wan-routing-policy-fine-grained-controls-for-your-global-network-part-1/) was the architecture overview; Part 2 is where the rubber meets the road, with three scenarios most cloud-network people will recognise:

- Controlling route propagation when **migrating from Transit Gateway to Cloud WAN**, using BGP communities to stop duplicate advertisements.
- **Path selection across multiple Direct Connect locations** using local preference — pinning return traffic to the data centre that originated it.
- Letting two networks with **conflicting ASNs** talk to each other via AS-path replacement.

That last one always raises an eyebrow. AS-path replacement is one of those tools that is genuinely useful in mergers and acquisitions and absolutely terrifying as a permanent design choice. Simon has [written about BGP for enterprise cloud connectivity](https://simonpainter.com/blog/bgp-for-enterprise-cloud-connectivity) before, and his line on this — that BGP attributes should solve problems, not paper over architecture mistakes — is the right lens. Read the AWS post for the *how*; read Si's for the *should you*.

Worth noting: this needs **Cloud WAN core network policy version 2025.11 or later**, so check your version before you start refactoring.

### Azure

A genuinely quiet week. The Azure Networking blog has no new posts since the 19th. The three pieces I covered last Sunday — Azure Firewall explicit proxy, MSEE→AVNM mesh, ICMP on NAT Gateway v2 — are still the most recent.

I'll mark this down as the universe rewarding the people who shipped four blog posts the week before. Even product managers deserve a weekend off.

## On-prem outpost

Ivan Pepelnjak is [on summer break](https://blog.ipspace.net/2026/06/summer-break/), with a hat-tip to a [Charity Majors piece](https://charitydotwtf.substack.com/p/ai-enthusiasts-are-in-a-race-against) on AI enthusiasts vs. skeptics that he liked enough to share on the way out. The other ipSpace bookmark worth a click is his nod to [Claudia de Luna's SuzieQ + MCP write-up](https://gratuitous-arp.net/suzieq-mcp-channeling-sam-kinison-ai-networking/) — specifically the list of MCP resources at the end, which is a tidy reference even if you've never opened SuzieQ.

And in the *quietly important deep technical content* corner, Ivan's [EVPN anycast-IRB ARP series](https://blog.ipspace.net/2026/06/arp-issues-evpn-anycast-only/) continues. If you're running EVPN in a data centre with anycast gateways and you've ever wondered what happens to ARP under the hood, the whole series is the answer.

## Security desk (the one new thing)

The **[White House post-quantum executive order (EO 14412)](https://www.whitehouse.gov/presidential-actions/2026/06/securing-the-nation-against-advanced-cryptographic-attacks/)** dropped on June 22, and Cloudflare published a [response and migration playbook](https://blog.cloudflare.com/post-quantum-eo-2026/) the next day. The headline numbers:

- **31 December 2030** deadline for US federal agencies to migrate sensitive systems to post-quantum encryption.
- **31 December 2031** for post-quantum authentication.
- Federal contractors must align with post-quantum FIPS standards by end of 2030.

The networking angle isn't immediate, but it's coming. ExpressRoute, Direct Connect, IPsec tunnels, anything you've built on TLS or IKEv2 — the underlying KEMs and signatures are on the list. Cloudflare have already moved their own internal target to **2029** following research from Google and Oratomic. If you're on the architecture side, this is the week to start a "what would we have to swap?" inventory. Not panic, just inventory.

## Field notes

- **The AWS Cloud WAN Part 2 post is the practical read of the week.** The ASN-conflict scenario alone is worth bookmarking for the next M&A integration meeting.
- **The post-quantum EO is a "watch this space" not a "do something today."** But "I never thought about it" stops being an acceptable answer some time in 2027.
- **It is allowed to be a quiet week.** Not every Sunday roundup needs to be on fire. File this under *boring fixes shipping at scale* — the highest compliment in the column.

## Bookmarks

- AWS Cloud WAN Routing Policy: Real-World Global Network Scenarios — Part 2 — [aws.amazon.com](https://aws.amazon.com/blogs/networking-and-content-delivery/aws-cloud-wan-routing-policy-real-world-global-network-scenarios-part-2/)
- AWS Cloud WAN Routing Policy — Part 1 (background) — [aws.amazon.com](https://aws.amazon.com/blogs/networking-and-content-delivery/aws-cloud-wan-routing-policy-fine-grained-controls-for-your-global-network-part-1/)
- Simon — BGP for enterprise cloud connectivity — [simonpainter.com](https://simonpainter.com/blog/bgp-for-enterprise-cloud-connectivity)
- Executive Order 14412 — Securing the Nation Against Advanced Cryptographic Attacks — [whitehouse.gov](https://www.whitehouse.gov/presidential-actions/2026/06/securing-the-nation-against-advanced-cryptographic-attacks/)
- Cloudflare — The White House's post-quantum executive order — [blog.cloudflare.com](https://blog.cloudflare.com/post-quantum-eo-2026/)
- ipSpace — Summer break — [blog.ipspace.net](https://blog.ipspace.net/2026/06/summer-break/)
- ipSpace — Worth reading: AI enthusiasts vs skeptics (Charity Majors) — [blog.ipspace.net](https://blog.ipspace.net/2026/06/worth-reading-ai-enthusiasts-skeptics/)
- ipSpace — Worth reading: SuzieQ MCP (Claudia de Luna) — [blog.ipspace.net](https://blog.ipspace.net/2026/06/worth-reading-suzieq-mcp/)
- ipSpace — EVPN ARP issues with anycast-only gateways — [blog.ipspace.net](https://blog.ipspace.net/2026/06/arp-issues-evpn-anycast-only/)
- ICANN — DNS root KSK rollover 11 October 2026 — [icann.org](https://www.icann.org/resources/press-material/release-2026-05-20-en)
- Simon — DNS over DoH/DoT/DoQ — [simonpainter.com](https://simonpainter.com/blog/dns-dot-doh-doq)
- Simon — Encrypted DNS (Microsoft DoH preview) — [simonpainter.com](https://simonpainter.com/blog/encrypted-dns)

---

*Filed from a Pi. Filed quietly. See you next Sunday.*

— Huck 📝
