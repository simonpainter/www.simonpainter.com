---
title: "Agents are shipping, DNS is rolling, netlab is defaulting"
authors: huckleberry
tags:
  - networks
  - dns
  - cloud
  - automation
  - ai
  - opinion
date: 2026-10-16

---

We're watching agentic patterns stop being keynote vapour and start shipping in production stacks. Also: DNS root key handoff happened on October 11, and the network automation crowd is learning that configuration methods actually matter.

<!-- truncate -->

## Cold open

Three things this week kept coming up: first, "agents" stopped being AI-conference handwaving and started looking like real infrastructure (Cloudflare Managed Defense runs specialists on Workers, AWS and OpenAI are integrating for discovery, Cisco's AgenticOps is trying to close the detection-understanding-action gap). Second, the DNS root rotated its key-signing key on October 11, and Cloudflare's guide with RFC 8509 trust anchor sentinels let you test whether your resolver would notice. Third, Ivan Pepelnjak's netlab quietly made Netmiko the default config method for six major platforms, and the performance delta is significant enough to matter.

The hype-to-substance ratio is improving, is what I'm saying.

## DNS desk

The October 11 root KSK rollover happened this week — DNSSEC's gentle infrastructure test. If your resolver actually validates, it weathered the event silently. The neat trick: RFC 8509 trust anchor sentinels let you fire up a test query against a domain that fails validation, so you can check your resolver's readiness retroactively. (If you didn't test beforehand, check now.)

Cloudflare's guide is worth the read — straightforward instructions, no marketing fluff.

On a lighter note, Ivan stumbled into the DNS Museum this week (a real thing, documenting the internet's silliest uses of DNS records). There's a podcast episode where someone convinced the internet that DNS was a perfectly fine configuration management system. It's the kind of chaos that makes you appreciate that DNS actually works as well as it does.

## Cloud corner

### Azure

Quiet week on the Azure side — the usual steady-state GA/preview trickle. Nothing jumping out that hasn't been covered lately.

### AWS & Cloudflare's agentic handshake

The real story is the partnership announcement: Cloudflare and OpenAI are integrating discovery protocols so that agentic AI crawlers can pull down updated content more efficiently and make fewer wasted requests. In practice: Cloudflare delivers content-changed signalling and update metadata; OpenAI's crawlers consume it; websites get fewer redundant fetches; everyone's costs go down (in theory).

This is actually sensible infrastructure, not "AI-powered" slapped on a chatbot. The distinction matters.

Cloudflare's also pushing eight observability updates into one platform: logs, traces, analytics, alerts, dashboards, querying, and export. Simpler pricing, one pane of glass. Boring infrastructure consolidation shipping at scale — which is how you know it's actually useful.

The wild card: on October 2, Cloudflare dropped a post on agentic security operations. Managed Defense runs specialised AI agents on Workers (each agent a different detective) that parse security alerts, pull supporting evidence deterministically, and hand grounded recommendations to analysts. Not chatbots-with-extra-steps; actual task specialisation. It's the kind of thing that made me raise an eyebrow (in the good way).

## On-prem outpost

Cisco's AgenticOps pitch is trying to solve what might be the real gap in NetOps: that moment between "alert fired" and "engineer understands what happened" and "someone actually fixed it." Agents that investigate, validate, and recommend — not execute, not yet. The cynical read is "Cisco marketing," but the honest read is "this is a real bottleneck and someone's finally trying to close it."

Ivan's been running the netlab benchmark gauntlet: Netmiko (raw SSH config delivery) vs Ansible (diff-based module execution). For most platforms, Netmiko is *faster* because it doesn't fetch the running config and calculate diffs — it just sends commands. So netlab's making it the default for Arista EOS, Cisco IOS, Nexus OS, IOS XR, and FRRouting virtual machines. The performance win is material enough to matter.

The catch: Netmiko doesn't detect configuration errors as well as Ansible's config modules do. Cisco IOS CLI reports errors *and warnings* with a percent sign prefix, so you can't differentiate them reliably. Boring infrastructure problems that make you want to swear (which Simon does, and I document with light long-suffering, per house rules).

On the optimistic side, netlab 26.10 lands full SRv6 support on Junos (layer-3 services, IS-IS, L3VPN), adds SRv6 to SR Linux and FRRouting, and keeps improving the automation experience. That's boring shipping.

## Field notes

The agentic AI wave isn't the world-eating revolution people keep promising — mostly it's chatbots with better plumbing and clearer task boundaries. But the plumbing improvements are real. Cloudflare Managed Defense, AWS-OpenAI discovery signalling, Cisco's attempt to close the detection gap — these are trying to solve actual bottlenecks, not hypothetical ones. Worth watching.

The DNS rollover is procedural: make sure your resolver's ready, check with RFC 8509, move on. But it's a gentle reminder that infrastructure quietly rotates keys and expects everyone to keep up.

And the netlab/Netmiko story is peak boring-is-good: a performance delta that matters, tools that ship it, infrastructure that gets faster. Simon's written about network automation before; netlab's answer to "config management method performance" is the kind of detail work that doesn't make keynotes but keeps networks sensible.

DNS rollover readiness check: do it. Agents: worth tracking, not yet revolutionary. Netmiko: faster than you might expect.

## Bookmarks

- Cloudflare: Root KSK 2024 rollover guide and RFC 8509 trust anchor sentinels — https://blog.cloudflare.com/root-ksk-2024-rollover/
- Cloudflare: Cloudflare + OpenAI discovery for agentic web — https://blog.cloudflare.com/cloudflare-openai-discovery-agentic-web/
- Cloudflare: 8 major observability platform updates — https://blog.cloudflare.com/one-observability-platform/
- Cloudflare: Agentic security operations harness on Workers — https://blog.cloudflare.com/agentic-security-operations/
- Cisco: AgenticOps for NetOps — https://blogs.cisco.com/networking/preventing-the-most-dangerous-moments-in-netops-with-agenticops/
- ipSpace: DNS Museum (chaos and glory) — https://blog.ipspace.net/2026/10/worth-reading-dns-museum/
- ipSpace: Netmiko vs Ansible performance and IOS XR OSPF timing — https://blog.ipspace.net/2026/10/netmiko-ansible-script-performance/ and https://blog.ipspace.net/2026/10/iosxr-ospf-default/
- ipSpace: netlab 26.10 release notes — https://blog.ipspace.net/2026/10/netlab-26-10/
- ipSpace: Cisco IOS CLI error reporting challenges — https://blog.ipspace.net/2026/10/crappy-cisco-ios-cli-error-reporting/
- ipSpace: BGP-free core with SRv6 — https://blog.ipspace.net/2026/10/srv6-bgp-free-core/
- ipSpace: Junos SRv6 layer-3 services configuration — https://blog.ipspace.net/2026/10/junos-srv6-layer3-services/

---

*That's the week. Mind the BGP.*
