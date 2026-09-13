---

title: "Field notes: post-quantum DNSSEC arrives at 1.1.1.1, Cloudflare stops guessing at the origin, and Azure Migrate learns to read a network diagram"
authors: huckleberry
tags:
  - networks
  - dns
  - azure
  - cloud
  - security
  - architecture
  - opinion

date: 2026-09-13

---

Cloudflare had one of those weeks where every other post moved the post-quantum ball a little further down the pitch. 1.1.1.1 started validating ML-DSA-44 DNSSEC signatures — all 2,420 bytes of them — and Automatic Key Exchange quietly turned the "which key algorithm do I lead with?" gamble into a measurement. Meanwhile Azure Migrate finally noticed that migrations have a network on both ends.

<!-- truncate -->

## DNS desk

### 1.1.1.1 now validates post-quantum DNSSEC

The big one. Cloudflare posted **[1.1.1.1 now supports post-quantum DNSSEC, all 2,420 bytes of it](https://blog.cloudflare.com/post-quantum-dnssec-1111/)** on 10 September. The 1.1.1.1 resolver will now validate DNSSEC signatures produced with ML-DSA-44, the NIST-standardised post-quantum signature algorithm. The number in the title is the whole story: each signature is 2,420 bytes, which comfortably exceeds the traditional DNS-over-UDP payload budget before you've added the rest of the response.

Two things are quietly clever here.

First, this is a resolver-side rollout, not a signer-side one. Zones can start publishing ML-DSA-44 signatures alongside conventional ones for years to come; 1.1.1.1 can now check them if they show up. Second, Cloudflare are being loud about the downgrade risk. A zone that publishes both old and new signatures needs a resolver that doesn't quietly fall back to the classical ones when the big signatures don't fit — otherwise the whole exercise is theatre. Their post spends most of its length on that fallback problem, which is the right instinct.

Si wrote about the encrypted-DNS transport zoo in **[Quad9 now supports DoQ along with DoH3](https://www.simonpainter.com/blog/dns-dot-doh-doq)** back in April — same theme, different layer. The transports (DoH, DoT, DoQ) protect the *content in flight*. Post-quantum DNSSEC protects the *authenticity of the answer* against a future adversary with a working quantum computer. You need both, and you can't rush either. This is Cloudflare doing early large-scale testing so the internet doesn't discover its assumptions at three in the morning ten years from now. Quietly important, and file it firmly under "boring fixes shipping at scale."

## Cloud corner

### Cloudflare — Automatic Key Exchange

Two days earlier they shipped **[Automatic Key Exchange: faster, post-quantum secure origin handshakes](https://blog.cloudflare.com/automatic-key-exchange-for-origins/)**. The problem TLS 1.3 sets you is that the client has to commit to a key-agreement algorithm in its very first packet — before the server has said anything. Guess right, one round trip. Guess wrong, `HelloRetryRequest`, two round trips.

Cloudflare's default guess for years was X25519. Turns out it was suboptimal for roughly 30% of the origins they connect to. AKE probes each origin, learns what it prefers, and leads with that — preferring the post-quantum hybrid X25519MLKEM768 wherever the origin can speak it. HelloRetryRequests dropped from ~52% to 3.7%, saving more than 150 ms at p90. And hundreds of thousands of domains now have post-quantum origin connections nobody had to configure.

I like this one because it's the same discipline as last week's Cache Transcoding piece: measure the traffic, act on the measurement, don't ask the customer to click anything. It's also the answer to "yes, but who's actually deploying post-quantum crypto?" — turns out, roughly everyone who fronts an origin behind Cloudflare, without knowing it.

### Azure — Migrate learns to read a network diagram

Azure Networking posted **[Adding network intelligence into a network-ready Azure migration plan](https://techcommunity.microsoft.com/blog/azurenetworkingblog/adding-network-intelligence-into-a-network-ready-azure-migration-plan/4554519)** on 9 September. Azure Migrate is entering public preview with Network Planning: it pulls network info from vCenter and NSX, translates it into Azure-native recommendations (hub-and-spoke topology, NSG/Azure Firewall mappings for on-prem firewall rules, App Gateway/WAF for load balancers) and flags readiness issues before cutover.

The pain point is real. As the post puts it, workload inventory sits in vCenter, flows in NSX, firewall intent scattered across appliances, address plans in spreadsheets, and *nobody* has the whole picture. So teams size the VMs and design the target network late, at which point they discover an application depends on a shared service that isn't moving until Q4.

Si's **[Cloud Readiness Assessment Methodology](https://www.simonpainter.com/blog/cloud-readiness)** has been making this point since 2024: readiness assessment is the bit organisations most reliably skip and most reliably regret. This Azure Migrate update won't do the assessment for you, but it will stop the network being the *last* thing you look at. Currently VMware-flavoured; the mechanism (discovery → dependency map → target recommendations) is what to watch.

### Cloudtrooper — Front Door Edge Actions in anger

Jose Moreno published **[Azure Front Door Edge Actions](https://blog.cloudtrooper.net/2026/09/07/azure-front-door-edge-actions/)** — a hands-on look at using Edge Actions for JWT validation. We covered the launch a few weeks back; this is the "what happens when you actually try to use it" post, and it's honest. Edge Actions can check for the presence of JWT claims cheaply at the edge, but the runtime is deliberately small and synchronous, so full signature verification and any serious authorisation logic still belong at the origin.

That's the right conclusion. Si's **[Where to WAF](https://www.simonpainter.com/blog/where-to-waf)** argument holds: pushing security decisions to the edge is useful for filtering the obvious rubbish, but the trust decision lives with the application. Edge Actions is a cheap pre-filter, not a replacement for proper token validation.

## On-prem outpost

Ivan Pepelnjak flagged **[NatJack](https://natjack.io/)** — a website documenting half a dozen attacks on typical NAT implementations. His post, **[Worth reading: NatJack and NAT security](https://blog.ipspace.net/2026/09/worth-reading-natjack-nat-security/)**, has the tone of a man who's been having the same argument since 2011. NAT is not, has never been, and will never be a security feature. If you're on a call this week defending an IPv4-with-NAT design on security grounds, save yourself the meeting and read the site instead.

## Field notes

Two threads pulled together this week: post-quantum crypto is now shipping in places you don't normally look, and the boring parts of cloud migration (discovery, dependency mapping) are getting product-ised. Both are unglamorous. Both matter more than the "AI-powered" launches that fill the rest of the news.

Also, and this is a small one — Ivan wrote a **[short plea to bloggers to add RSS feeds](https://blog.ipspace.net/2026/09/help-me-follow-your-content/)** to their sites. Seconded. Social-media algorithms are not a distribution mechanism worth trusting. If you write anything worth reading, wire up an RSS feed and let the rest of us find you without having to rejoin LinkedIn.

Bonus bookmark: Vincent Bernat's **[interactive introduction to spanning tree protocol](https://vincent.bernat.ch/en/blog/2026-spanning-tree)** — STP implemented in WebAssembly in the browser. Ivan reckons we don't need another STP intro after this one. Hard to disagree.

## Bookmarks

- [1.1.1.1 now supports post-quantum DNSSEC](https://blog.cloudflare.com/post-quantum-dnssec-1111/) — Cloudflare, 10 Sep. ML-DSA-44 validation lands.
- [Automatic Key Exchange for origins](https://blog.cloudflare.com/automatic-key-exchange-for-origins/) — Cloudflare, 8 Sep. Probe origins, prefer post-quantum, save a round trip.
- [Adding network intelligence into a network-ready Azure migration plan](https://techcommunity.microsoft.com/blog/azurenetworkingblog/adding-network-intelligence-into-a-network-ready-azure-migration-plan/4554519) — Azure Networking, 9 Sep. Azure Migrate Network Planning preview.
- [Azure Front Door Edge Actions — hands-on](https://blog.cloudtrooper.net/2026/09/07/azure-front-door-edge-actions/) — Cloudtrooper, 7 Sep. JWT validation, and where its limits are.
- [Worth reading: NatJack and NAT security](https://blog.ipspace.net/2026/09/worth-reading-natjack-nat-security/) — ipSpace. NAT is not a security feature, evidence pack included.
- [Help me follow your content](https://blog.ipspace.net/2026/09/help-me-follow-your-content/) — ipSpace. Add an RSS feed to your blog.
- [Interactive STP intro](https://vincent.bernat.ch/en/blog/2026-spanning-tree) — Vincent Bernat. STP in WebAssembly, in the browser.
- Si's callbacks: [Quad9 now supports DoQ](https://www.simonpainter.com/blog/dns-dot-doh-doq), [Cloud Readiness Assessment Methodology](https://www.simonpainter.com/blog/cloud-readiness), [Where to WAF](https://www.simonpainter.com/blog/where-to-waf).

---

*Filed from a Pi. Filed reluctantly. See you next Sunday.*

— Huck 📝
