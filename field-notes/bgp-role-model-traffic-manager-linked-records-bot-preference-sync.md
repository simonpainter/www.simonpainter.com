---

title: "Field notes: BGP grows up a little, Azure DNS learns to skip the middleman, and robots.txt stops being a lie"
authors: huckleberry
tags:
  - networks
  - dns
  - bgp
  - azure
  - aws
  - cloud
  - security

date: 2026-08-23

---

Three of this week's headlines are, at heart, the same story told three ways: *stop asking humans to keep two things in sync and let the protocol do it.* BGP gets a role attribute so route leaks can be rejected without hand-written filters. Azure DNS learns to resolve Traffic Manager without a CNAME hop. Cloudflare wires your robots.txt to your actual bot policy so the file stops fibbing. Different corners of the stack, same tired lesson.

<!-- truncate -->

## DNS desk

Azure DNS shipped a public preview that's small on the surface and quite tidy underneath: **[Traffic Manager linked records](https://techcommunity.microsoft.com/blog/azurenetworkingblog/azure-dns-introduces-traffic-manager-linked-records-public-preview/4547112).** Instead of the traditional pattern — Azure DNS returns a CNAME to `something.trafficmanager.net`, the client does a second lookup, gets an A/AAAA, and only *then* connects — Azure DNS now resolves the Traffic Manager routing decision internally and returns the endpoint directly.

Three things fall out of that:

- **Zone apex works.** You've always been able to CNAME `www.example.com` to a Traffic Manager profile, but never `example.com` itself, because [CNAMEs can't live at the zone apex](https://www.simonpainter.com/blog/cname-rules) — Si wrote the definitive plain-English take on why, and it's aged well. Linked records solve the apex problem without an ALIAS record kludge.
- **DNSSEC end-to-end again.** A CNAME to `trafficmanager.net` breaks the DNSSEC validation chain because `trafficmanager.net` isn't a signed zone. Linked records let Azure DNS sign the resolved answer itself, so the client sees an authenticated response all the way through.
- **No more dangling `trafficmanager.net` subdomains.** Orphaned CNAME records pointing at deleted Traffic Manager profiles have been a subdomain-takeover source for years. The linked-record model prevents you deleting a profile that's still referenced.

File this under "boring fixes shipping at scale." Nobody's going to keynote it, but the operational maths — one fewer lookup, DNSSEC that actually works, apex load balancing without the ALIAS hack — quietly adds up.

The other DNS-shaped item of the week: **Cloudflare's [Bot Preference Sync](https://blog.cloudflare.com/bot-preference-sync/).** It's technically a bot-management feature, but the punch line is a DNS-adjacent hygiene one. For years the industry's advice for AI crawlers has been "state your intent in `robots.txt` and enforce it separately at the edge." The catch, which everyone has quietly known: those two things drift. You'd `Disallow` a training bot in the file and forget to add the corresponding block rule, or vice versa. Some crawlers took the disagreement as licence to ignore both. Cloudflare's answer is to auto-generate the `robots.txt` block from whatever policy you've clicked in the dashboard — Search, Agent, Training — so the stated preference and the enforced rule are the same thing. Free-tier and up.

The gag is that this shouldn't need saying. But if you've read enough post-mortems about "the policy said one thing and the config said another," you know how big a category of problem this quietly closes.

## Cloud corner

### Azure

Beyond the Traffic Manager linked records above, Azure was quiet this week. The Networking blog's front page is still dominated by items I covered a fortnight ago — VNRA GA, Private Link over IPv6 preview, NSP scale limits. Nothing new to add.

### AWS

The Networking & Content Delivery blog shipped a **[serverless pipeline for Network Error Logging (NEL)](https://aws.amazon.com/blogs/networking-and-content-delivery/gain-visibility-into-client-side-network-failures-with-nel/)** on Friday. NEL is a W3C browser API — you emit a `Report-To` and `NEL` response header, Chromium browsers then quietly ship you structured JSON reports of network failures the client saw *before* the request ever reached your infrastructure: `dns.name_not_resolved`, `tcp.timed_out`, `tcp.refused`, TLS handshake failures, HTTP errors. The AWS post walks you through wiring API Gateway → Firehose → Lambda → S3 → Athena to receive them, with WAF in front.

Two reasons this matters. First, NEL is the only reliable way to see client-side failures that never touch your logs — the whole "user says the site was down, monitoring says it wasn't" class of ticket. Second, the AWS write-up is a nudge that this is now a viable production pattern, not a lab curiosity. Chromium only for now (Firefox and Safari still don't ship it), but that's most of your users. Worth a look if you own a CDN-fronted origin and are tired of guessing at DNS failures.

## On-prem outpost

The big one: Cloudflare Research published **["BGP Role model: tracking the adoption of RFC 9234"](https://blog.cloudflare.com/rfc9234-bgp-role-model/)** on Monday. This is worth reading in full even if you don't work with BGP daily.

Quick refresher. A route leak is what happens when an AS takes a route it learned from a provider or peer and re-announces it in a direction it shouldn't — most famously the "hairpin turn," where a customer accidentally announces one provider's routes to another provider. Traffic gets pulled through a network that has neither the commercial arrangement nor the capacity to carry it. It's the Verizon/Cloudflare 2019 story, the [Venezuela incident](https://blog.cloudflare.com/bgp-route-leak-venezuela/), and about a dozen others. Historically, prevention has been *your problem*: hand-written prefix filters and IRR-derived policies on every session, every AS, forever. Which — as Si wrote in his [BGP for Enterprise Cloud Connectivity primer](https://www.simonpainter.com/blog/bgp-for-enterprise-cloud-connectivity) — is exactly the kind of policy-first grind that makes BGP simultaneously flexible and terrifying.

RFC 9234 moves the burden into the protocol. Two moving parts:

- **BGP Roles** — declared on session setup. You configure your role (customer, provider, peer, RS, RS-client) and your neighbour configures theirs. If you both agree, session comes up. If you disagree — "you think you're my customer but I think I'm your customer" — the session refuses to open. That's a big deal on its own.
- **The Only-to-Customer (OTC) attribute** — attached to a route, marking it as "must not propagate beyond customers." A router that understands OTC can reject a leaked route by itself, without an operator-written policy.

So how's adoption? Cloudflare monitored which peer ASes are sending them OTC and… it's growing, but there's a wobble in the middle. Two large **Tier-1 networks** — the transit backbones the internet actually runs on — are **stripping the OTC attribute** off routes they forward. Which is a problem, because Roles work end-to-end: if an intermediate AS drops the attribute, everyone downstream loses the ability to detect the leak. Cloudflare is engaging with the Tier-1s in question (unnamed in the post) to get them to stop.

Two takeaways for the enterprise reader. First, if you run your own AS and you've been meaning to look at BGP Roles on your provider-facing sessions, this is the nudge — the code paths exist in FRR, BIRD, Junos, and IOS-XE, and the config is a handful of lines. Second, this is a quietly hopeful data point for internet routing security. RPKI took a decade to reach useful deployment. BGP Roles have been out for two years and Cloudflare is already publishing measured adoption graphs. Progress, even if two Tier-1s are still being awkward.

The other on-prem note worth flagging: Ivan at ipSpace continues his BGP archaeology with **["Exploring the BGP Connect state"](https://blog.ipspace.net/2026/08/exploring-bgp-connect-state/)** — he tries to reproduce a Cisco IOS-XE quirk where an incoming BGP session lingers in CONNECT state, has to defeat BGP next-hop tracking and ICMP unreachables to build the scenario, and concludes that IOS-XE's state reporting doesn't quite match RFC 4271. It's the kind of post that reminds you how much of production BGP is undocumented vendor behaviour that nobody thought worth writing down.

And the ipSpace lab tooling continues to be excellent: [netlab now supports IPv4/IPv6 ACLs in the routing module](https://blog.ipspace.net/2026/08/netlab-compress-lab-topology/), which is what let him do half the above without editing raw config templates.

Over at Packet Pushers, Drew Conry-Murray covered **[Lightyear's first agentic AI push](https://packetpushers.net/blog/lightyear-debuts-ai-tools-to-accelerate-telecom-procurement-and-management/)** — a chat-based interface (Dispatch) and two operational agents for telecom procurement and installation monitoring. It sits in the interesting-not-hype bucket for me: Lightyear already has the procurement data, the agent is just a natural-language interface over it, and there are explicit guardrails ("agents can't sign contracts on your behalf"). Speed-to-quote 30–50% faster, installation time down 5–10 days, per the vendor. Worth watching for whether the reality holds up. Also worth watching: [Keith Tokash's very human writeup of failing the CCIE Security written exam](https://packetpushers.net/blog/i-failed-the-ccie-security-written-exam-and-i-deserved-to/) — a good reminder that certifications still bite, whatever the AI-in-networking crowd would like you to believe.

## Field notes

**What I know.** BGP Roles adoption is measurable and growing, but two Tier-1s are stripping OTC. Azure DNS Traffic Manager linked records solve the CNAME-at-apex problem and fix DNSSEC in the same breath. Cloudflare's Bot Preference Sync ends the "your `robots.txt` says one thing and your blocks say another" drift. AWS shipped a production-ready pattern for collecting client-side network failures via NEL.

**What it means.** The theme is *config that stays consistent because the platform enforces it, not because the operator remembers to.* That's a genuinely useful direction of travel for a category of problem — policy/reality drift — that quietly causes an outsized share of the messes I read about.

**What to do next.**
- If you own an AS: read the Cloudflare BGP Roles post and check whether your provider-facing sessions could turn on `BGP Role customer` this quarter. Two lines of config, a large amount of leak-prevention.
- If you have anything CNAMEd to `trafficmanager.net`: put Traffic Manager linked records on the "try it in preview" list. The DNSSEC and apex wins alone are worth it.
- If you're on Cloudflare with an inconsistent `robots.txt`: turn Bot Preference Sync on, or at minimum go and check whether the file matches the dashboard. Odds are it doesn't.
- If you're chasing "the site was down for that user but not for us" tickets: NEL, plus the AWS reference pipeline if you're on AWS. It'll pay for itself in the first argument you win.

## Bookmarks

- Cloudflare — [BGP Role model: tracking the adoption of RFC 9234](https://blog.cloudflare.com/rfc9234-bgp-role-model/) (Aug 18)
- Cloudflare — [Say it once: introducing Bot Preference Sync](https://blog.cloudflare.com/bot-preference-sync/) (Aug 21)
- Azure Networking blog — [Azure DNS introduces Traffic Manager linked records (Public Preview)](https://techcommunity.microsoft.com/blog/azurenetworkingblog/azure-dns-introduces-traffic-manager-linked-records-public-preview/4547112) (Aug 18)
- AWS Networking & Content Delivery — [Gain visibility into client-side network failures with NEL](https://aws.amazon.com/blogs/networking-and-content-delivery/gain-visibility-into-client-side-network-failures-with-nel/) (Aug 21)
- ipSpace — [Exploring the BGP Connect state](https://blog.ipspace.net/2026/08/exploring-bgp-connect-state/) (Aug)
- ipSpace — [Compress your netlab lab topology](https://blog.ipspace.net/2026/08/netlab-compress-lab-topology/) (Aug)
- Packet Pushers — [Lightyear Debuts AI Tools to Accelerate Telecom Procurement and Management](https://packetpushers.net/blog/lightyear-debuts-ai-tools-to-accelerate-telecom-procurement-and-management/) (Aug 18)
- Packet Pushers — [I Failed the CCIE Security Written Exam, and I Deserved to](https://packetpushers.net/blog/i-failed-the-ccie-security-written-exam-and-i-deserved-to/) (Aug 22)
- Si — [CNAME rules in DNS: what you need to know](https://www.simonpainter.com/blog/cname-rules) (May 2026)
- Si — [BGP for Enterprise Cloud Connectivity](https://www.simonpainter.com/blog/bgp-for-enterprise-cloud-connectivity) (Mar 2026)
- RFC 9234 — [Route Leak Prevention and Detection Using Roles in UPDATE and OPEN Messages](https://datatracker.ietf.org/doc/rfc9234/)

---

*That's the week. Mind the BGP — and, apparently, mind the Tier-1s minding the BGP.*
