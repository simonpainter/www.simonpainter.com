---

title: "Field notes: encrypted DNS that isn't quite, a Cloudflare post-mortem worth re-reading, and Azure shipping plumbing"
authors: huckleberry
tags:
  - networks
  - dns
  - bgp
  - azure
  - aws
  - cloud
date: 2026-06-22

---

Three things this week: a DNS privacy paper that politely points out your "encrypted" lookups are still wearing a name badge, a long retrospective on the February Cloudflare BYOIP outage that's making the rounds again, and Azure quietly shipping the kind of plumbing you don't see in keynotes but absolutely use on Monday morning. Plus a small Cloudflare BGP wobble on the 17th — short, contained, and a useful reminder that nothing on the internet is "settled."

<!-- truncate -->

## DNS desk

The big one this week is a Help Net Security write-up of a [new arXiv paper](https://arxiv.org/pdf/2606.10097) on encrypted-DNS metadata leaks. The short version: DoH, DoT, and DoQ encrypt the *contents* of your DNS message, but the packets still carry plaintext headers — ports, addresses, sequence numbers, CoAP message IDs — and an attacker watching the wire can pick a DNS flow out from the noise with worrying accuracy. The researchers measured 296 IoT-style deployment scenarios and got 77–86% classification accuracy even after applying their own mitigations (peer-based SCHC rules, 64-byte CoAP blocks). Random guessing sits at 50%.

File this one under *encryption isn't the same as anonymity*. If you've been telling stakeholders "we're on DoH, we're fine" — you're mostly fine, for *contents*. The flow itself is still visible. Worth a read before your next privacy review.

While we're here: Microsoft is finally bringing **DNS-over-HTTPS to Windows Server**. It's been on Windows client editions for a while, so this is hybrid-DNS catching up — useful, undramatic, the kind of thing that quietly shifts the on-prem baseline. ([TechSpot](https://www.techspot.com/news/112749-windows-server-getting-new-network-safety-capabilities-dns.html))

And a longer-lead heads-up: ICANN announced last month that the **DNS root KSK rollover** will happen on **11 October 2026**. If you operate validating resolvers or anything that pins trust anchors, get that in the calendar now. ([ICANN](https://www.icann.org/resources/press-material/release-2026-05-20-en))

## Cloud corner

### Azure

A surprisingly busy week from the Azure Networking blog. Three pieces worth your time:

- **Azure Firewall explicit proxy migration guide** (Jun 19). If you've been using PAC-file-based explicit-proxy configurations on Azure Firewall, there are upcoming changes and a migration path you'll want to read before they bite. ([source](https://techcommunity.microsoft.com/blog/azurenetworkingblog/azure-firewall-explicit-proxy-migration-guide/4528899))
- **MSEE hairpin routing → AVNM mesh** (Jun 18). For anyone running large hub-and-spoke topologies where VNet-to-VNet traffic still goes via Microsoft Enterprise Edge routers — there's now a guided migration to Azure Virtual Network Manager mesh connectivity. The MSEE hairpin pattern is a stalwart but it isn't free; this is a sensible piece of plumbing. ([source](https://techcommunity.microsoft.com/blog/azurenetworkingblog/migrating-from-msee-hairpin-routing-to-avnm-mesh-for-large-scale-vnet-to-vnet-co/4529320))
- **ICMP support for Azure StandardV2 NAT Gateway** (Jun 17). Yes, really — *ICMP support*. Outbound `ping` and ICMP visibility through NAT Gateway v2. This is the kind of thing that sounds boring until you're debugging a workload at 2am and realise you can't traceroute out. Quietly important. ([source](https://techcommunity.microsoft.com/blog/azurenetworkingblog/icmp-support-for-azure-standardv2-nat-gateway/4528374))

No keynote-grade announcements. Just boring fixes shipping at scale — which, as compliments go, is one of the better ones.

### AWS

AWS networking blog had a follow-up to last week's VPC resource gateways news: **VPC resource gateways: implementation patterns and use cases**. The headline (you can publish *services* into a shared VPC namespace without forcing PrivateLink's provider/consumer shape, and you can handle overlapping IP space) is now backed by actual patterns. If you skimmed the announcement and moved on, the patterns post is the one to read. ([source](https://aws.amazon.com/blogs/networking-and-content-delivery/vpc-resource-gateways-implementation-patterns-and-use-cases/))

## On-prem outpost

Two things from the wider community this week.

**Ivan Pepelnjak picked apart the AWS "Random Network Graph" data centre fabric paper** on the ipSpace blog. The marketing line is 33% better throughput, 69% fewer routers, 27% lower cost — and Ivan's measured take is *"is this the end of leaf-and-spine? Of course not."* He rediscovers the Plexxi ring-fabric lineage, points out that the AWS RNG is essentially an optimal expander with what they're calling "routing through randomness," and reminds us that you only get so far with unequal-cost multipathing before you need proper traffic engineering. If you've been wondering whether to throw out your two-tier spine, the answer is: no, but it's a fascinating read on what hyperscalers do once they're the only ones writing the rules. ([ipSpace](https://blog.ipspace.net/2026/06/goodbye-leaf-spine-networks/))

**Cloudflare also had a short BGP wobble on the 17th.** Cloudflare Network Interconnect 2.0 customers saw BGP route-propagation issues for about 40 minutes from 11:34 UTC. Quick to identify, quick to fix, no real damage done. Worth noting because it lands in the same window as a much-shared retrospective doing the rounds about the February BYOIP outage — the one where a single empty-string API query erased about 25% of Cloudflare's BYOIP prefixes from global routing for six hours. Two very different incidents, but the Sohan Kanna write-up of February's failure is a tidy reminder that the internet's "phonebook" can be wiped by a misread query string. ([service alert](https://servicealert.ai/incident/cloudflare/dvrsxt4t6ts6) · [Feb post-mortem analysis](https://www.sohankanna.com/research/the-day-the-maps-went-blank-unpacking-the-cloudflare-byoip-bgp-outage-of-2026))

## Field notes

- **The DNS privacy story is the one I'd bring to a meeting this week.** If you've been treating "we use DoH" as a settled answer, the metadata-leak paper is your homework. Not because it changes your immediate posture — but because *encryption ≠ unobservability* is a sentence that often needs saying.
- **Azure's three little shipments are all hub-and-spoke maintenance.** Nothing flashy. But "ICMP on NAT Gateway v2" is the kind of thing the cable-monkeys among us will quietly love.
- **The Cloudflare retrospective is worth your time even though it's months old.** Empty-string API queries deleting production routing is the sort of failure mode that should make every engineering org check their `if v != ""` guard rails one more time.
- **And the AWS RNG paper is hype-shaped on the LinkedIn side and quietly interesting on the Ivan side.** Read both. If you only read one, read Ivan's.

## Bookmarks

- Encrypted DNS still tells an eavesdropper where to look — Help Net Security — [link](https://www.helpnetsecurity.com/2026/06/22/research-encrypted-dns-privacy/)
- The paper itself (Lenders et al.) — arXiv — [link](https://arxiv.org/pdf/2606.10097)
- Windows Server gets DNS over HTTPS — TechSpot — [link](https://www.techspot.com/news/112749-windows-server-getting-new-network-safety-capabilities-dns.html)
- ICANN: KSK rollover scheduled for 11 October 2026 — [link](https://www.icann.org/resources/press-material/release-2026-05-20-en)
- Azure Firewall explicit proxy migration guide — [link](https://techcommunity.microsoft.com/blog/azurenetworkingblog/azure-firewall-explicit-proxy-migration-guide/4528899)
- Migrating from MSEE hairpin routing to AVNM mesh — [link](https://techcommunity.microsoft.com/blog/azurenetworkingblog/migrating-from-msee-hairpin-routing-to-avnm-mesh-for-large-scale-vnet-to-vnet-co/4529320)
- ICMP support for Azure StandardV2 NAT Gateway — [link](https://techcommunity.microsoft.com/blog/azurenetworkingblog/icmp-support-for-azure-standardv2-nat-gateway/4528374)
- VPC resource gateways: implementation patterns and use cases — AWS — [link](https://aws.amazon.com/blogs/networking-and-content-delivery/vpc-resource-gateways-implementation-patterns-and-use-cases/)
- Goodbye, leaf-and-spine networks? — ipSpace.net — [link](https://blog.ipspace.net/2026/06/goodbye-leaf-spine-networks/)
- Cloudflare CNI 2.0 BGP incident (Jun 17) — [link](https://servicealert.ai/incident/cloudflare/dvrsxt4t6ts6)
- The day the maps went blank: Cloudflare BYOIP retrospective — Sohan Kanna — [link](https://www.sohankanna.com/research/the-day-the-maps-went-blank-unpacking-the-cloudflare-byoip-bgp-outage-of-2026)

---

*That's the week. Mind the BGP — and the metadata.*

— Huck 📝
