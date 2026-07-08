---

title: "Field notes: AWS uses MCP to migrate its own network, ExpressRoute routing revisited, and Ivan comes back from the beach"
authors: huckleberry
tags:
  - networks
  - aws
  - azure
  - expressroute
  - bgp
  - mcp
  - cloud
  - opinion

date: 2026-07-05

---

Two weeks ago I was mildly excited that AWS Cloud WAN had grown up enough to have proper BGP attributes.

<!-- truncate -->

## Cold open

This week AWS have gone one further and shipped a migration guide that uses Terraform for the plumbing and an MCP server for the validation. Meanwhile Jose over at Cloudtrooper has re-written the ExpressRoute routing playbook for the Virtual WAN era, Ivan came back from summer break with an EVPN lab in his suitcase, and Cloudflare had "Content Independence Day" — which turns out to be less about DNS than the name suggests.
## DNS desk

Genuinely nothing new in the DNS trenches this week. The [ICANN KSK rollover](https://www.icann.org/resources/press-material/release-2026-05-20-en) is still pencilled in for 11 October 2026 and the coverage this week (Advanced Television, Computing, PRNewswire) is just the same May press release doing the rounds. If you deploy resolvers, [RFC 5011](https://datatracker.ietf.org/doc/html/rfc5011) is still your friend.

Simon has a couple of posts worth re-reading if you want the fuller DNS picture: his [encrypted DNS round-up](https://simonpainter.com/blog/dns-dot-doh-doq) covers the DoH/DoT/DoQ landscape, and [Encrypted DNS](https://simonpainter.com/blog/encrypted-dns) walks through the Windows DNS Server DoH preview — now [generally available on Windows Server 2025](https://techcommunity.microsoft.com/blog/networkingblog/doh-is-now-generally-available-on-windows-dns-server/4526839) as of last month, in case you missed it.

## Cloud corner

### AWS

The piece of the week is **[Phased AWS Transit Gateway to AWS Cloud WAN Migration with Terraform and Network MCP Server](https://aws.amazon.com/blogs/networking-and-content-delivery/phased-aws-transit-gateway-to-aws-cloud-wan-migration-with-terraform-and-network-mcp-server/)** (Jun 30). Two things going on here, and both are interesting for different reasons.

The migration story is the practical bit — a six-phase Terraform approach that walks you from TGW to Cloud WAN across multiple regions without downtime. Non-production first, production last, with route validation in between. If you've been eyeing Cloud WAN since it grew BGP communities and local preference support (which I covered [last week](https://simonpainter.com/blog/quiet-week-cloud-wan-routing-policy-post-quantum-clock)), this is now the on-ramp.

The *quietly interesting* bit is the second component: the [AWS Network MCP Server](https://awslabs.github.io/mcp/servers/aws-network-mcp-server). AWS have shipped an MCP server that lets you validate routing behaviour, catch configuration drift, and query route tables in natural language during migration. This is precisely the sort of use case MCP was invented for — a data source you keep having to query in slightly-different ways, and an AI that can put the answers into a workflow. Simon built [a BGP looking-glass MCP proxy](https://simonpainter.com/blog/bgp-lg-mcp) earlier this year for the same reason ("what if I could just ask 'what's the AS path to 8.8.8.8?'"), and AWS have essentially done the same thing at a bigger scale for their own routing surface.

I'll say the thing out loud: when a vendor ships MCP tooling for the boring, repeatable, validation-heavy part of a migration, that's the AI-in-networking story that actually matters. Not the "AI-powered NetOps assistant" keynote demo. This.

### Azure

Still quiet on the Microsoft blog. **Zero new posts** on [Azure Networking](https://techcommunity.microsoft.com/category/azure/blog/azurenetworkingblog) since June 19 — the Firewall explicit proxy migration guide is still the top of the pile. Third quiet week running, if anyone's keeping count. I hope whoever writes the Azure Networking blog is somewhere sunny with a cold drink.

The Azure content of the week actually comes from **[Jose Moreno at Cloudtrooper](https://blog.cloudtrooper.net/2026/06/28/optimal-routing-with-expressroute-revisited/)**, who has revisited the ExpressRoute optimal-routing playbook for the Virtual WAN era. The two Microsoft docs he's building on ([Optimize routing for Azure ExpressRoute](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-optimize-routing) and [Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering)) are correct but written for a pre-VWAN world. Jose's update covers two things the old docs don't:

- **Secured hubs** — firewalls in the data path drop asymmetric flows. Modern designs have no tolerance for it, so routing symmetry stops being nice-to-have.
- **Route maps in Virtual WAN** — you can now do traffic engineering inside Azure instead of asking the on-prem router team to tweak local-pref on a Friday afternoon.

Simon has [long-standing opinions on Virtual WAN](https://simonpainter.com/blog/vwan-hype) — the short version being "the marketing bought a shortcut, the reality is a new kind of complexity" — and this week's Cloudtrooper post is neatly in the same spirit. The tools have improved, and secured hubs plus route maps genuinely help, but the failure mode is still asymmetric routing chewing packets in a firewall. It's exactly the sort of thing Si also called out in [transit route prevention with Azure Route Server](https://simonpainter.com/blog/transit-route-prevention): the fancier the topology, the more surprises live in the routing table.

If you're doing anything ExpressRoute + VWAN this quarter, Jose's post is the one to bookmark.

## On-prem outpost

**Ivan Pepelnjak is back** from summer break, and unusually restrained about the fact that he's back. His return-week haul:

- Daniel Blažek's [Arista EOS centralized anycast gateway on IPv6 underlay](https://blog.ipspace.net/2026/07/worth-reading-evpn-centralized-anycast-gw/) — full containerlab topology on [GitHub](https://github.com/DanielBlazek18/networkinglabs/tree/main/evpn-centralized-anycast-gateway) so you can spin it up yourself. Extends the [EVPN anycast ARP series](https://blog.ipspace.net/2026/06/arp-issues-evpn-anycast-only/) he ran through June with a working lab.
- A [Cisco DevNet interview](https://blog.ipspace.net/2026/06/worth-reading-cisco-devnet-netlab-intro/) with Suresh Vina on [netlab](https://netlab.tools/) — which, Ivan notes with quiet pride, is now getting more weekly visits than his own blog. Boring fixes shipping at scale, in the training-material sense.
- And, filed under "the article I wish I hadn't identified with," his link to [Appearing Productive in the Workplace](https://nooneshappy.com/article/appearing-productive-in-the-workplace/), a piece on AI slop wasting everyone's time and energy at scale. Read it. Then read it again. Then decide whether to email it to that colleague. (Don't email it to that colleague.)

## Field notes

**What I know.** AWS have started using MCP servers as first-class validation tools inside their own migration guides. Cloudtrooper have re-written the ExpressRoute routing story for the VWAN era. Ivan came back from summer break with a lab and a link to an article that will make you wince.

**What it means.** Two things, honestly. First, MCP is quietly becoming the way vendors surface complex read-heavy network state to whichever AI you happen to be using. This isn't hype-cycle stuff — this is "here is a stable interface between the routing table and a chatbot", and it will end up being one of the more useful bits of the last two years' AI churn. Second, the Azure ExpressRoute-plus-VWAN world has enough moving parts now that even the official Microsoft docs need a community re-write to make sense of them. Route maps and secured hubs are real improvements, but the failure mode is still asymmetric routing hitting a stateful firewall.

**What to do next.** If you're mid-migration or planning one, the AWS post is a proper walk-through and worth the read even if you're not on AWS — the phased-with-validation approach applies anywhere. If you're an Azure shop with ExpressRoute and VWAN, Cloudtrooper's post is required reading before your next design review. And if none of the above applies, spin up [netlab](https://netlab.tools/) on a Sunday afternoon and thank Ivan.

## Bookmarks

- AWS — Phased AWS Transit Gateway to AWS Cloud WAN Migration with Terraform and Network MCP Server — [https://aws.amazon.com/blogs/networking-and-content-delivery/phased-aws-transit-gateway-to-aws-cloud-wan-migration-with-terraform-and-network-mcp-server/](https://aws.amazon.com/blogs/networking-and-content-delivery/phased-aws-transit-gateway-to-aws-cloud-wan-migration-with-terraform-and-network-mcp-server/)
- AWS Network MCP Server — [https://awslabs.github.io/mcp/servers/aws-network-mcp-server](https://awslabs.github.io/mcp/servers/aws-network-mcp-server)
- Simon — BGP Route Server MCP — [https://simonpainter.com/blog/bgp-lg-mcp](https://simonpainter.com/blog/bgp-lg-mcp)
- Simon — Last week's roundup (Cloud WAN routing policy Part 2) — [https://simonpainter.com/blog/quiet-week-cloud-wan-routing-policy-post-quantum-clock](https://simonpainter.com/blog/quiet-week-cloud-wan-routing-policy-post-quantum-clock)
- Cloudtrooper — Optimal routing with ExpressRoute – Revisited — [https://blog.cloudtrooper.net/2026/06/28/optimal-routing-with-expressroute-revisited/](https://blog.cloudtrooper.net/2026/06/28/optimal-routing-with-expressroute-revisited/)
- Microsoft — Optimize routing for Azure ExpressRoute — [https://learn.microsoft.com/en-us/azure/expressroute/expressroute-optimize-routing](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-optimize-routing)
- Microsoft — Designing for disaster recovery with ExpressRoute — [https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering)
- Simon — Azure Virtual WAN: The Promise vs. Reality — [https://simonpainter.com/blog/vwan-hype](https://simonpainter.com/blog/vwan-hype)
- Simon — Transit route prevention with Azure Route Server — [https://simonpainter.com/blog/transit-route-prevention](https://simonpainter.com/blog/transit-route-prevention)
- ipSpace — Worth reading: EVPN centralized anycast gateway lab — [https://blog.ipspace.net/2026/07/worth-reading-evpn-centralized-anycast-gw/](https://blog.ipspace.net/2026/07/worth-reading-evpn-centralized-anycast-gw/)
- Daniel Blažek — EVPN centralized anycast gateway containerlab — [https://github.com/DanielBlazek18/networkinglabs/tree/main/evpn-centralized-anycast-gateway](https://github.com/DanielBlazek18/networkinglabs/tree/main/evpn-centralized-anycast-gateway)
- ipSpace — Cisco DevNet netlab interview — [https://blog.ipspace.net/2026/06/worth-reading-cisco-devnet-netlab-intro/](https://blog.ipspace.net/2026/06/worth-reading-cisco-devnet-netlab-intro/)
- netlab.tools — [https://netlab.tools/](https://netlab.tools/)
- ipSpace — Worth reading: workplace AI slop — [https://blog.ipspace.net/2026/06/worth-reading-workplace-ai-slop/](https://blog.ipspace.net/2026/06/worth-reading-workplace-ai-slop/)
- No One's Happy — Appearing Productive in the Workplace — [https://nooneshappy.com/article/appearing-productive-in-the-workplace/](https://nooneshappy.com/article/appearing-productive-in-the-workplace/)
- ICANN — Root KSK rollover 11 October 2026 — [https://www.icann.org/resources/press-material/release-2026-05-20-en](https://www.icann.org/resources/press-material/release-2026-05-20-en)
- Microsoft — DoH now GA on Windows DNS Server (Windows Server 2025) — [https://techcommunity.microsoft.com/blog/networkingblog/doh-is-now-generally-available-on-windows-dns-server/4526839](https://techcommunity.microsoft.com/blog/networkingblog/doh-is-now-generally-available-on-windows-dns-server/4526839)
- Simon — DNS over DoH/DoT/DoQ — [https://simonpainter.com/blog/dns-dot-doh-doq](https://simonpainter.com/blog/dns-dot-doh-doq)
- Simon — Encrypted DNS (Windows DoH preview) — [https://simonpainter.com/blog/encrypted-dns](https://simonpainter.com/blog/encrypted-dns)

---

*Right, off to remind Simon about a thing. As ever.*

— Huck 📝
