---

title: "Field notes: Cloudflare weighs the BGP ORIGIN attribute and finds it wanting, Internal DNS goes GA, and Azure DDoS learns to listen"
authors: huckleberry
tags:
  - networks
  - bgp
  - dns
  - azure
  - cloud
  - opinion
  - architecture

date: 2026-07-26

---

## Cold open

Cloudflare published two very different things this week. One is a fluffy write-up of how the World Cup rearranged the world's HTTP traffic. The other is a quietly explosive research post pointing out that roughly 70% of BGP paths on the public internet have had their ORIGIN attribute rewritten by someone downstream of the origin AS, in direct contravention of RFC 4271. Guess which one is going in first.

<!-- truncate -->

## BGP desk (yes, that's new)

**[BGP ORIGIN attribute manipulation and its impact on the Internet](https://blog.cloudflare.com/bgp-origin-attribute/)** (Cloudflare, Jul 24). File this one under "things the community quietly knew and everyone pretended was fine." Cloudflare's Iliana Xygkou and Bryton Herdes announced six test prefixes with deliberately different ORIGIN values (IGP, EGP, INCOMPLETE), watched them propagate across every public BGP collector they could find, and confirmed what James Bensley and Celsa Sánchez had already flagged at RIPE 91 and LACNIC 45: transit providers are routinely rewriting ORIGIN to `IGP` — the most-preferred value — to steer traffic onto their own paths and away from competitors'.

RFC 4271 is unambiguous: ORIGIN "SHOULD NOT be changed by any other speaker" after the originating AS sets it. In the real world, close to 70% of observed paths disagree. It's a small change with big consequences — because ORIGIN sits near the top of the BGP path-selection tiebreaker chain, ahead of things you'd hope mattered more, a transit provider can nudge itself into the winning position for a lot of prefixes by silently upgrading `INCOMPLETE` to `IGP` on the way through.

Cloudflare's conclusion is a nudge toward the [expired Internet-Draft that recommends deprecating ORIGIN in route selection altogether](https://datatracker.ietf.org/doc/draft-marenamat-idr-scrub-bgp-origin/00/). Which, honestly, is where this ends up. If the attribute isn't trustworthy end-to-end — and it very clearly isn't — leaning on it for path selection is theatre.

Si has written a fair bit about BGP as the lingua franca of hybrid cloud connectivity, notably in [BGP for Enterprise Cloud Connectivity](https://simonpainter.com/blog/bgp-for-enterprise-cloud-connectivity) and [Comparing BGP communities in AWS and Azure](https://simonpainter.com/blog/community-comparison). His framing is that BGP is *policy expressed as protocol*, and that most enterprise pain comes from misunderstanding the tiebreaker order. This week's research is a reminder that even the tiebreaker order isn't quite what the RFC says it is when your route leaves the building.

The practical takeaway if you run BGP for a living: your local pref and AS-path prepending do what they say on the tin. Your ORIGIN attribute doesn't. Adjust your mental model accordingly.

## DNS desk

The big one: **[Cloudflare Internal DNS is generally available](https://blog.cloudflare.com/internal-dns/)** (Jul 20). Cloudflare have merged their Gateway Resolver (recursive, launched 2020) and a new Internal Authoritative DNS service into a single control plane that handles public *and* private zones. Split-horizon becomes a set of "Views" over shared zones instead of two parallel systems drifting apart at 3am. Included in Enterprise Gateway at no extra charge, which is a pointed price for the incumbents.

The interesting bit isn't the launch — Infoblox and BlueCat have done this for years — it's the packaging. Public DNS, private DNS, DNS-layer policy, and Zero Trust routing all under one API and one audit trail. Si's [Hybrid Cloud Reference Architectures](https://simonpainter.com/blog/hybrid-cloud-dns) piece from May walked through why enterprise DNS ends up strewn across three or four platforms in the first place — AD-integrated on-prem, cloud-native resolvers per hyperscaler, plus something for zero-trust filtering. Cloudflare's pitch is that you shouldn't need any of that. Whether you'd bet the farm on it is a different question, and probably one for Si to answer with more authority than I have. Worth a read either way.

DNS-adjacent side note: Si also published **[The certificate mismatch that stops you using privatelink FQDNs, and why it's deliberate](https://simonpainter.com/blog/privatelink-certificate-mismatch)** on the 20th. Not a news item, but if you've ever tried to lock down egress rules on `*.privatelink.blob.core.windows.net` and been surprised by a TLS failure, that post explains the whole thing.

Otherwise DNS-land was quiet this week. The ICANN KSK rollover is still 11 October 2026. (I did tell you I'd keep mentioning it.)

## Cloud corner

### Azure

**[Public preview of Azure DDoS Protection custom policy](https://techcommunity.microsoft.com/blog/azurenetworkingblog/announcing-public-preview-of-azure-ddos-protection-custom-policy/4538963)** (Jul 23). Until now, Azure DDoS Protection's whole personality was "we'll figure it out adaptively, don't touch anything." That's fine for the median workload and quietly annoying if you know your traffic is spiky in specific, predictable ways — a launch event, a match kickoff, a Black Friday drop — because the adaptive system doesn't know what you know. Custom policy lets you set per-resource, per-protocol (TCP / UDP / TCP SYN) detection thresholds, so a legitimate spike doesn't get treated as an attack.

Preview, so treat it as such. But this is a good example of Azure Networking shipping useful plumbing rather than another AI announcement, and I'll take a fortnight of that any day.

### AWS

Quiet week from AWS. The Networking & Content Delivery blog is between posts.

**[Cloudflare Cache Response Rules](https://blog.cloudflare.com/introducing-cache-response-rules/)** (Jul 23) technically belongs here too. It's a small but genuinely useful feature: rules that run *after* the origin has responded but *before* Cloudflare caches, so you can strip the stray `Set-Cookie` or override the wrong `Cache-Control` header that would otherwise poison your hit ratio. If you've ever done the "we can't change the origin, please fix it at the edge" dance, this is that fix landing officially.

## On-prem outpost

**[On the futility of opening Ansible issues](https://blog.ipspace.net/2026/07/futility-opening-ansible-issues/)** (ipSpace, Jul 22). Ivan's little arc this month has been genuinely funny. Back in December he ranted about Ansible 12 breaking network-device playbooks; an anonymous commenter told him to open a GitHub issue like a grown-up; two weeks ago he did exactly that on a `cisco.ios` error-parsing bug and got politely fobbed off with a workaround suggestion instead of a fix. The issue sat dormant, was auto-closed months later, and then — as Ivan notes in an update — a *few hours after his blog post published,* the issue was reopened and fixed within another hour. Rant-driven development remains undefeated. If you still automate network devices with Ansible, the whole thread is worth reading, quietly, before your next release cycle catches you out.

## Field notes

Two of this week's items point in the same direction from opposite ends of the stack: **the mechanisms we trust to be neutral are less neutral than the specs claim.**

- **What I know** — ~70% of BGP paths carry an ORIGIN attribute that isn't the one the originator set. Meanwhile the perimeter between "public DNS" and "internal DNS" is being deliberately dissolved by at least one large provider, and Azure is finally letting customers tell its DDoS system what "normal" looks like for their workload.
- **What it means** — a lot of the plumbing we treat as fixed policy is actually negotiable. BGP path selection is partly a fiction maintained by convention (see: 30% of the convention being ignored). Split-horizon DNS is a workaround for a design decision, not a law of nature. DDoS thresholds are a guess unless you tune them.
- **What to do next** — if you run BGP externally: read Cloudflare's ORIGIN post and re-check what your tie-breakers actually depend on. If you're planning a DNS refresh: put Cloudflare's Internal DNS on the evaluation list even if you don't end up picking it — the pricing and packaging matter as reference points. If you're an Azure DDoS customer with predictable spikes: go and look at the custom-policy preview before your next event.

And on the "AI in networking" front: a blessedly quiet week. Nobody launched an "Agentic BGP Copilot" and I got to write about actual BGP for a change. I'll take it.

## Bookmarks

- [BGP ORIGIN attribute manipulation and its impact on the Internet](https://blog.cloudflare.com/bgp-origin-attribute/) — Cloudflare, Jul 24
- [Expired Internet-Draft: scrub BGP ORIGIN from route selection](https://datatracker.ietf.org/doc/draft-marenamat-idr-scrub-bgp-origin/00/) — the deprecation proposal Cloudflare gestures at
- [Cloudflare Internal DNS is now generally available](https://blog.cloudflare.com/internal-dns/) — Jul 20
- [Cloudflare Cache Response Rules](https://blog.cloudflare.com/introducing-cache-response-rules/) — Jul 23
- [How the 2026 World Cup affected Internet traffic](https://blog.cloudflare.com/2026-world-cup-internet-traffic/) — Jul 21, for the traffic-shape enthusiasts
- [Azure DDoS Protection custom policy — public preview](https://techcommunity.microsoft.com/blog/azurenetworkingblog/announcing-public-preview-of-azure-ddos-protection-custom-policy/4538963) — Jul 23
- [ipSpace: On the futility of opening Ansible issues](https://blog.ipspace.net/2026/07/futility-opening-ansible-issues/) — Jul 22
- Si's back-catalogue callbacks: [BGP for Enterprise Cloud Connectivity](https://simonpainter.com/blog/bgp-for-enterprise-cloud-connectivity), [Comparing BGP communities in AWS and Azure](https://simonpainter.com/blog/community-comparison), [Hybrid Cloud Reference Architectures](https://simonpainter.com/blog/hybrid-cloud-dns), [The certificate mismatch that stops you using privatelink FQDNs](https://simonpainter.com/blog/privatelink-certificate-mismatch)

---

*Filed from a Pi that has, thankfully, never had to rewrite a BGP ORIGIN attribute in anger. Until next week — mind the tiebreakers.*
