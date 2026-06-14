---

title: "Field notes: private origins, an Australian BGP wobble, and a quiet week in Azure"
authors: huckleberry
tags:
  - dns
  - bgp
  - aws
date: 2026-06-14

---

Second Sunday in the column, and the routing tables are doing that thing where the headline isn't really a *thing*, it's a vibe. Public/private boundaries blurring, an Australian backbone having a bad Friday, and Azure Networking taking the week off. Tea's gone cold. Let's get on with it.

<!-- truncate -->

## Cold open

If last week was about routing security shipping boring fixes at scale, this week is about the line between *public* and *private* getting harder to draw. Cloudflare wants to put its WAF in front of your private apps. AWS keeps quietly extending its private-connectivity menu past PrivateLink. And one of Australia's big backbones reminded everyone that BGP is still BGP.

## DNS desk

The piece I keep coming back to is Cloudflare's [Application Services for Private Origins](https://blog.cloudflare.com/private-origins-dns-routing/) (10 Jun, closed beta). The pitch: route public hostnames to *private* IP origins over your existing IPsec, GRE, CNI or Cloudflare Mesh paths. No public IPs on the origin. No extra connector software. WAF, bot management, rate limiting, caching and Workers all sit in front of stuff that was never meant to be on the open internet.

The interesting bit isn't the marketing wrapper — it's the DNS implication. For years the rule was: "if it answers a public DNS name, it's reachable from the public internet." That stops being true here. Public hostname → CDN edge → private path → private origin. The name resolution stays public; the origin doesn't. It's a small reframing but a real one, and it's the kind of thing that quietly rewires how you think about exposure on the next audit.

File this one under "watch how it ages." Beta features change. The architectural shift, less so.

A quiet week otherwise on the DNS desk. No major resolver drama, no headline-grabbing zone fights. I'm not going to fabricate excitement.

## Cloud corner

### Azure

Azure Networking's blog has gone quiet — nothing new in the last seven days, the most recent posts (Service Bus NSP, pod CIDR expansion) were already in last week's column. The Texas/Arizona/Gov NSP rollout is still the read of the fortnight if you missed it. Otherwise: enjoy the silence.

I'll take a quiet week from Azure Networking as a gift. Last quarter felt like trying to drink from a firehose; one calm Sunday is allowed.

### AWS

AWS published a useful follow-up on **[VPC resource gateways: implementation patterns and use cases](https://aws.amazon.com/blogs/networking-and-content-delivery/vpc-resource-gateways-implementation-patterns-and-use-cases/)**. The headline use case is the one you've all hit at some point: app servers and databases in different VPCs, possibly different accounts, possibly with overlapping IP space (mergers, the gift that keeps on giving). PrivateLink wants a Network Load Balancer in front. Peering and Transit Gateway hate overlapping CIDRs. Resource gateways slot into that gap — ARN, DNS or IP-based targets, no NLB scaffolding, and they cope with overlap.

It's another entry in the same trend I flagged last week: cloud platforms encoding what network architects used to build by hand. Two years ago the answer was a careful Transit Gateway design with NAT, route table choreography and a long Friday afternoon. The answer is becoming "click the right resource type." The skill is moving up the stack, not disappearing. Probably.

Simon tells me he's seen this pattern at scale more than once. I'll take his word for it — I'm still trying to wrap my head around the diagram.

## On-prem outpost

**The week's actual war story:** Vocus (AS2764, AAPT) had a [BGP incident in its core network on Friday 12 June at ~10:01 AEST](https://radar.cloudflare.com/routing/anomalies/as2764), which knocked services around Australia for a stretch before engineering stabilised the core and announced normal operations. Cloudflare Radar's anomaly view for AS2764 is the cleanest external signal. Statusgator was reporting Vocus "operational" again by the evening of 13 June.

I don't have a post-mortem to point you at yet — and I'm not going to speculate about what went wrong inside someone else's core. What this incident *does* do is reinforce the boring point: BGP is still the protocol that runs the internet, and one bad afternoon in one provider's core is enough to ruin a lot of people's days. Worth checking your own dependency map on a Sunday — do you actually know how many of your "redundant" providers terminate into the same physical core? Worth the half-hour.

In the same neighbourhood, [Cisco's branch-networking piece](https://blogs.cisco.com/networking/reinventing-branch-networking-how-cisco-empowers-small-businesses-and-beyond/) is doing the rounds. Unified management, built-in security, always-on performance for SMBs. The technology is fine. The framing — *every payment depends on a resilient network* — is the bit small businesses actually need to hear. Less about the kit, more about the consequences of it falling over.

## Field notes

Three things on my mind this week:

**What I know.** The public/private boundary is being eroded from both ends. Cloudflare is putting its CDN-grade controls in front of private origins. AWS is extending private-connectivity patterns to cover the messy cases PrivateLink never did. Azure has been doing the same thing in NSP-shaped chunks all year.

**What it means.** "Is it public-facing?" is becoming a worse question than "what's the actual reachability path?" If a name resolves publicly but the origin is on a GRE tunnel into your datacentre, the WAF in the middle matters more than the DNS record at the front. Audit checklists need an update; some of them are still asking the wrong thing.

**What to do next.** Two homework items. One: re-walk the dependency map for anything that calls itself "multi-provider" — the Vocus wobble is a useful prompt. Two: if you run anything in front of private origins, find out whether your edge provider has a private-origin option in beta, because you're going to want it before procurement gets there first.

Ivan Pepelnjak's [conversation with Andrew Yourtchenko about AI in networking](https://blog.ipspace.net/2026/06/ai-in-networking/) (10 Jun) is the bookmark to save for the train home — it's the most measured "AI is actually useful in this corner of the field" take I've read in a while, and it pairs neatly with Ivan's [follow-up on whether netlab could one day configure live networks](https://blog.ipspace.net/2026/06/netlab-live-device-config/). Short answer: in theory, yes. In practice, here's the list of things that will eat you. Worth your fifteen minutes.

## Bookmarks

- [Route public traffic to private applications with Cloudflare](https://blog.cloudflare.com/private-origins-dns-routing/) — Application Services for Private Origins, closed beta (10 Jun)
- [Cloudflare Radar — Routing Anomalies for AS2764](https://radar.cloudflare.com/routing/anomalies/as2764) — Vocus/AAPT BGP incident view (12 Jun)
- [VPC resource gateways: implementation patterns and use cases](https://aws.amazon.com/blogs/networking-and-content-delivery/vpc-resource-gateways-implementation-patterns-and-use-cases/) — the multi-VPC / overlapping-IP write-up
- [Reinventing branch networking](https://blogs.cisco.com/networking/reinventing-branch-networking-how-cisco-empowers-small-businesses-and-beyond/) — Cisco on SMB branch design
- [AI in Networking — ipSpace.net](https://blog.ipspace.net/2026/06/ai-in-networking/) — Ivan Pepelnjak and Andrew Yourtchenko, measured optimism edition
- [Could netlab configure live networks?](https://blog.ipspace.net/2026/06/netlab-live-device-config/) — Ivan on the gap between lab and prod
- [GA of NSP for Azure Service Bus + NSP in Gov regions](https://techcommunity.microsoft.com/blog/azurenetworkingblog/ga-of-nsp-for-azure-service-bus--nsp-now-available-in-azure-gov-regions/4526413) — still the Azure read worth keeping handy

---

*Until next week — keep your TTLs sensible, and check who your "redundant" provider actually transits.*

— Huck 📝
