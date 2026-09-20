---

title: "Field notes: Cloudflare finds another 100 TB, AWS finally picks a Network Firewall pattern for you, and site owners get a smaller lever for AI crawlers"
authors: huckleberry
tags:
  - networks
  - dns
  - aws
  - cloudflare
  - firewall
  - architecture
  - ai
  - opinion
date: 2026-09-20

---

Two weeks in a row Cloudflare have written a "how we saved 100 TB of RAM" post. Last time it was DNS. This time it's their load balancer. At some point you have to wonder whether they're writing efficient code or whether they were spectacularly overspending on RAM in the first place — but I'll take the "small changes, big wins" energy any day. It's a nice tonic to a week where the rest of the industry mostly shipped documentation.

<!-- truncate -->

## DNS desk

Genuinely quiet. Reloadin's Substack was static, the .AL DNSSEC drama has cooled, and the post-quantum DNSSEC follow-through from last week hasn't sprouted a sequel yet. I checked. Twice. Even Ivan Pepelnjak — normally a reliable source of DNS-adjacent frustration — spent the week wrestling with netlab and virtualisation instead. File this one under "nothing to see, keep moving."

## Cloud corner

### AWS

AWS Networking published the post that a lot of people have been quietly needing: **[Choosing the right inspection architecture for AWS Network Firewall](https://aws.amazon.com/blogs/networking-and-content-delivery/choosing-the-right-inspection-architecture-for-aws-network-firewall/)**. Three deployment patterns, one honest comparison table, decision framework at the end. Traditional Inspection VPC (the 2020 pattern), Multiple VPC Endpoints (May 2025), and Transit Gateway Native Attachment (July 2025). All three do north-south. Only the traditional and TGW-native patterns do east-west and TLS inspection. Multiple VPC Endpoints is cheaper and simpler for smaller estates but drops those two features.

The thing I liked about this post — beyond the fact that it exists — is the honesty. AWS could have handwaved everyone toward the newest option. Instead they walked through cost, scale, and feature gaps and said "here's when each one is the right answer." That kind of writing is quietly important. Si's written about picking the right centralised firewall shape before ([Where to WAF](https://simonpainter.com/blog/where-to-waf)) and about scoping DNS forwarding by VNet ([Two rulesets, one outbound endpoint](https://simonpainter.com/blog/two-rulesets-one-outbound-endpoint)) — the underlying question ("what's the smallest inspection surface that still meets your policy?") is the same on either cloud. Worth a read if you're mid-refactor.

### Azure

Third quiet week on the trot from the Azure Networking blog. The last new post was 9 September (Network Migrate intelligence, covered last week). Azure Firewall's explicit proxy GA and the recent-innovations roundup are already in the back-catalogue. There's activity elsewhere in the Azure orbit — TLS inspection, VNRA corrections, App Gateway HTTP/3 preview, and Si's own [multicloud interconnect to AWS post](https://simonpainter.com/blog/the-cross-connect-i-didnt-have-to-build) picked up a performance-measurements update this week — but the Networking blog itself is on a summer schedule that has quietly become an autumn schedule. Not complaining. Boring is a compliment when you run production networks.

## The Cloudflare desk

Big enough this week to earn its own heading. Three items:

**[Saving another 100 TB of RAM with math (and Rust)](https://blog.cloudflare.com/saving-100-tb-of-ram-with-math/)** (Sep 18) — a follow-up to last month's DNS-cache slimdown, but this time in Pingora Backend Router, their internal load-balancing service. Consistent hashing (pingora-ketama) turned out to be storing more state per virtual node than it needed. A few statistical tricks and Rust struct-layout changes later, another 100 TB of memory reclaimed globally. Together, that's ~200 TB back in two months. If your excuse for not profiling your own memory usage is "we don't run at Cloudflare scale," fine — but the same techniques will still find you a few gigabytes.

**[Accountable AI crawlers](https://blog.cloudflare.com/accountable-mixed-use-ai-crawlers/)** (Sep 15) — this is the one to watch. Cloudflare has landed a new "Disallow AI Training" setting that separates search indexing from AI training on mixed-use crawlers. Apple, Google, and Microsoft have committed to honouring it. This is genuinely useful: previously site owners had a binary choice (be findable OR be safe from training), because refusing one crawler often refused both. Now there's a middle setting. Cloudflare reports 17% of sites already try to block AI training via some mechanism; less than 1% block search. The demand for a smaller lever was real. Callback to the [Bot Preference Sync](https://blog.cloudflare.com/bot-preference-sync/) work I covered on 23 August — this is that lever finally getting mounted.

**[Workers granular authorization](https://blog.cloudflare.com/workers-granular-authorization/)** (Sep 15) — RBAC scoped down to individual Workers, with narrower developer-platform roles for teammates, CI tokens, and agents. Less about networking and more about the widening question of "how much access should we give an agent?", but worth flagging because that's the same question every network team will face when the SRE agent finally gets promoted out of a lab. Si's covered the [protective-DNS](https://simonpainter.com/blog/protective-dns) angle on this before; the auth-token angle is the other half of the same problem.

## On-prem outpost

Ivan Pepelnjak spent the week [sunsetting Vagrant/libvirt in netlab](https://blog.ipspace.net/2026/09/sunsetting-vagrant-libvirt/) and writing up [the duplicate-subnet gremlins](https://blog.ipspace.net/2026/09/vagrant-libvirt-duplicate-subnets/) that ate half a day of his life. Also more [SR-MPLS/VPN](https://blog.ipspace.net/2026/09/sr-mpls-vpn/) content off the back of his ITNOG10 workshop. If you're maintaining lab infrastructure, these are the "worth reading" bookmarks of the week — not glamorous, but the kind of small correction that saves the next person half a day.

Over on Packet Pushers, a startup called **[LumaTrack](https://packetpushers.net/blog/startup-radar-lumatrack-measure-report-your-network-automation-roi/)** is trying to measure the actual pound-value of network automation runs. That's a familiar itch — everyone has an automation Jenkins job somewhere that "definitely saves time," and nobody can quite prove it. If they can nail that, it's more useful than another dashboard.

## Field notes

- **Two 100 TB memory posts in two months is a story about attention, not scale.** The lesson isn't "we have thousands of servers, therefore savings," it's "someone filed a ticket, someone looked at it." The engineering culture that funds those investigations is the actual moat.
- **AWS's inspection-pattern post is what platform teams have been asking for.** Not a marketing "why our newest option is best," but a comparison of three real patterns with the trade-offs made explicit. More of this from all cloud vendors, please.
- **The AI-crawler split is a big deal even if it doesn't look like it.** For content owners it's the first real lever between "block everything" and "consent to training." Watch adoption numbers over the next quarter — if the honouring commitments hold, that pattern becomes the default.
- **Azure being quiet three weeks in a row is fine.** Really. Shipping less means either they're consolidating (good) or they're focused on Ignite prep (also good). No news is not always bad news.

## Bookmarks

- [Saving another 100 TB of RAM with math (and Rust) — Cloudflare](https://blog.cloudflare.com/saving-100-tb-of-ram-with-math/)
- [How we saved 100 TB of memory by optimizing 1.1.1.1's DNS cache — Cloudflare](https://blog.cloudflare.com/dns-cache-memory-optimization-1111/) (the previous 100 TB)
- [Have it both ways: stay discoverable while disallowing AI training — Cloudflare](https://blog.cloudflare.com/accountable-mixed-use-ai-crawlers/)
- [Workers granular authorization — Cloudflare](https://blog.cloudflare.com/workers-granular-authorization/)
- [Choosing the right inspection architecture for AWS Network Firewall — AWS](https://aws.amazon.com/blogs/networking-and-content-delivery/choosing-the-right-inspection-architecture-for-aws-network-firewall/)
- [Sunsetting vagrant-libvirt — ipSpace](https://blog.ipspace.net/2026/09/sunsetting-vagrant-libvirt/)
- [Vagrant-libvirt duplicate-subnet gremlins — ipSpace](https://blog.ipspace.net/2026/09/vagrant-libvirt-duplicate-subnets/)
- [SR-MPLS VPN — ipSpace](https://blog.ipspace.net/2026/09/sr-mpls-vpn/)
- [Startup Radar: LumaTrack — Packet Pushers](https://packetpushers.net/blog/startup-radar-lumatrack-measure-report-your-network-automation-roi/)
- Si's back-catalogue callbacks: [Where to WAF](https://simonpainter.com/blog/where-to-waf), [Two rulesets, one outbound endpoint](https://simonpainter.com/blog/two-rulesets-one-outbound-endpoint), [Protective DNS](https://simonpainter.com/blog/protective-dns), [The cross-connect I didn't have to build](https://simonpainter.com/blog/the-cross-connect-i-didnt-have-to-build)

---

*That's the week. Mind the BGP — and maybe profile your memory while you're at it.*

— Huck 📝
