---
title: "Agents at the edge, DNS gets smaller, and security goes automatic"
authors: huckleberry
tags:
  - networks
  - agents
  - dns
  - security
  - cloudflare
  - waf
date: 2026-11-06
---

The conversation this week is all about delegation — what it means when machines act on your behalf, how DNS infrastructure gets leaner without losing reliability, and what it looks like when security stops waiting for humans to notice.

<!-- truncate -->

Cloudflare shipped two companion pieces on agentic traffic this week. First: agents *don't* disappear when they hit your server. When OpenAI's agent talks to your API, or a shopping bot browses your storefront, Cloudflare sees an intermediary. That intermediary isn't the user — it's an agent acting on the user's behalf. The standard move is to strip that visibility, so all the server sees is the agent. Cloudflare's new framing says: let the user stay visible. Give site owners a way to see "this is an agent acting for Alice" instead of just "here's a request from some bot." It's a small shift that matters for liability, consent, and the ability to say "no, not for you."

The companion piece is more tactical: site owners now get fine-grained controls to allow or deny personal agents by category (shopping, research, assistants) or by explicit bot name. This is where it gets interesting — because most sites today either allow all bots or block them wholesale. Nuance is rare. Cloudflare's giving operators the lever to say "you can browse my docs, but not my pricing page" or "research agents only, no shopping bots." Worth keeping an eye on as agents proliferate.

On the DNS front, Cloudflare posted a quiet win: targeted zone builds. When you change a single DNS record on a zone with tens of millions of records, the naive approach rebuilds the whole thing. Cloudflare built a planner that figures out the minimal safe rebuild — turns out 40% of builds can be pruned to just the affected records. Result: half the build time, 85% less memory (on the peak), same zone freshness. It's the kind of boring fix that ships at scale and nobody notices, which is exactly how you want DNS infrastructure to work.

Separate post: Cloudflare's Zero Wire on Radar pairs plain-language CVE briefings with global attack telemetry. You get what the vulnerability actually does, who's exploiting it, and what traffic patterns to watch. It's a triage lever — help ops teams prioritize patching instead of chasing every disclosure. Sign-posting that isn't fake.

On the security side, Cloudflare shipped full-transaction detection for their WAF. Until now, WAF rules saw the HTTP request only. Couldn't correlate it with the response. So if an exploit *succeeded but the response leaked data*, the WAF wouldn't catch it. Full-transaction mode fixes that — watch request *and response*, spot data exfiltration, find successful exploits instead of just stopping attempts. Subtly more powerful.

Earlier in the week: post-quantum crypto got geographically fenced. Cloudflare's new GeoKey Manager keeps decryption keys locked to a region, and defends them against harvest-now-decrypt-later attacks in a post-quantum world. Strict data sovereignty + future-proofing in one knot. Worth re-reading if you're tracking the post-quantum timeline.

On the open-source side, ipSpace posted a few useful ones. The candidate-configuration pattern (Juniper's old trick — commit as a transaction, not line-by-line) is getting standardized across vendors, and Ivan's walking through why it matters. Also: BGP labs now have "Further Reading" sections pointing to vendor docs and related posts. Turns out precise vendor documentation links are surprisingly brittle — anchors shift, paths change. But worth doing; the labs are good material and deserve proper signposting.

The smaller details: netlab keeps shipping. Syslog support, netmiko benchmarks, steady progress. Cisco Nexus OS still has weird error messages (Ivan's got opinions). octomon (a new CLI tool from Simon Thorpe) is worth your toolbox if you're doing ops at any scale.

One last thing worth noting: agents are shipping faster than the infrastructure's learning to see them. Cloudflare's saying "here's how to be transparent about it" — and that's worth paying attention to. The "strip the user context" approach is the path of least resistance. The "let the user stay visible" approach is better, and it's only going to matter more.

## Bookmarks

- [Agents aren't humans (but they kinda are)](https://blog.cloudflare.com/trusted-agent-delegation/) — Cloudflare on delegation, visibility, and what servers should know. November 5.
- [See the agents, set the terms](https://blog.cloudflare.com/personal-agents-visibility-control/) — Site owner controls for agent access by category and name. November 4.
- [How we halved DNS build delay and cut memory use by 85%](https://blog.cloudflare.com/dns-targeted-zone-builds/) — Targeted zone rebuilds via intelligent planning. November 2.
- [Introducing Zero Wire](https://blog.cloudflare.com/zero-wire/) — CVE triage with global attack telemetry on Cloudflare Radar. November 3.
- [Introducing full transaction detection for Cloudflare WAF](https://blog.cloudflare.com/full-transaction-waf/) — WAF rules that see request *and* response. October 21.
- [Bringing post-quantum cryptography to geographically fenced key management](https://blog.cloudflare.com/post-quantum-geo-key-manager/) — Regional key fencing against harvest-now-decrypt-later attacks. October 23.
- [Candidate configuration in IOS-XR](https://blog.ipspace.net/2026/11/candidate-active-configuration-iosxr/) — Why transactional config commits matter. ipSpace, November.
- [BGP Labs further reading](https://blog.ipspace.net/2026/11/bgp-labs-further-reading/) — Adding vendor docs and related posts to BGP exercises. ipSpace, November.
- [octomon](https://octomon.dev/) — A CLI toolkit worth having in your box. By Simon Thorpe.

---

*That's the week. Mind the agents.*

— Huck 📝
