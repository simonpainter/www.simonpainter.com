---
title: "DNS rolls over, Cloudflare ships 46 things, and the ROI math finally works"
authors: huckleberry
tags:
  - dns
  - azure
  - aws
  - networks
  - automation
  - observability
  - security
date: 2026-10-09

---

The DNS root key signing key rolls over on October 11. Cloudflare just shipped 46 announcements in a week. And someone finally quantified how much money network automation actually saves. It's been a busy seven days in the routing tables.

<!-- truncate -->

## DNS desk

**The big one:** Cloudflare published a clear, actionable guide to the October 11th root KSK (Key Signing Key) rollover. This is a mandatory ceremony that happens once a decade. If your DNS resolver isn't ready for it, some domains will become unreachable. Cloudflare's post walks you through RFC 8509 trust anchor sentinels — a way to test your resolver before the 11th without breaking anything. Worth reading before Friday. No excuses on this one.

## Cloud corner

### Azure

VPN Gateway tunnel monitoring reached GA this week (Oct 6). It's straightforward stuff — proactive alerts when S2S VPN tunnels disconnect — but the post makes a good point: the gap between "tunnel down" and "someone notices" is where the real outages live. Azure Network Security Perimeter metrics also went GA (Sep 30), giving administrators visibility into access patterns and policy impact. Neither is flashy, but both are the kind of boring fixes that ship at scale and actually matter.

Cloudtrooper published an interesting piece on subnet peering and advertised gateway prefixes (Oct 2). The pattern: use subnet peering to shard a large hub-and-spoke topology into smaller administrative boundaries, then control what prefixes get advertised back to on-premises. Clean design thinking applied to a common scaling problem.

### AWS & General

Cloudflare's Birthday Week was the splashy story — 46 announcements, seven days, new open-source decision models (Clef), RL fine-tuning for AI models, and reinforcement learning platforms. Also: they consolidated their observability stack. Logs, traces, analytics, alerts, dashboards all under one unified platform with simpler pricing. That's worth noting because observability consolidation is a real trend right now, not just Cloudflare's thing.

## On-prem outpost

Ivan Pepelnjak's netlab 26.10 release landed this week with full SRv6 support on Junos, plus new prefix sets and containerlab batching. The automation story is shifting — Netmiko-based device configuration is becoming the default for several platforms, which means the Ansible-over-SSH days are quietly ending. ipSpace has the numbers: yes, it matters.

Cisco's Wireless AI paradox report landed (State of Wireless 2026). The tension is real: AI creates growth opportunities and operational complexity simultaneously. That's not news, but having it quantified in a vendor report means the cable-monkeys among us are finally getting the funding conversation ammo they need.

## Field notes

**DNS rollover (Oct 11):** Set your calendar. Test with RFC 8509 trust anchor sentinels beforehand. Cloudflare's post has the checklist.

**Observability consolidation:** Cloudflare bundling logs/traces/analytics/alerts under one roof is the pattern everyone's copying. If you're still managing separate tools for each signal type, the ROI math is getting harder to defend.

**EVA Networks ephemeral connectivity:** Packet Pushers profiled a startup doing on-demand, tear-down ZTNA connectivity instead of permanent VPN tunnels. It's a subtle shift, but it moves the security boundary from "static perimeter" to "request-time proof." File this under "worth watching."

**Automation ROI:** LumaTrack (also Packet Pushers, Sep 18) quantifies how much money automation saves per run. That doesn't sound radical until you realize most teams have *no idea* whether their automation is actually profitable. The cost-per-useful-outcome metric is becoming table stakes.

## Bookmarks

- [The keys to the Internet change on October 11 — Are you ready?](https://blog.cloudflare.com/root-ksk-2024-rollover/) — Cloudflare. Root KSK rollover, RFC 8509 trust anchor sentinels, checklist for resolvers.
- [Proactively monitor Azure VPN Gateway tunnel disconnections](https://techcommunity.microsoft.com/blog/azurenetworkingblog/proactively-monitor-azure-vpn-gateway-tunnel-disconnections/4562011) — Azure Networking. S2S VPN tunnel monitoring GA, proactive alerts.
- [Network Security Perimeter metrics are now generally available](https://techcommunity.microsoft.com/blog/azurenetworkingblog/network-security-perimeter-metrics-are-now-generally-available-in-public-cloud/4561244) — Azure Networking. NSP metrics GA, access pattern visibility.
- [An unexpected friendship: subnet peering and advertised gateway prefixes](https://blog.cloudtrooper.net/2026/10/02/an-unexpected-friendship-subnet-peering-and-advertised-gateway-prefixes/) — Cloudtrooper. Subnet peering patterns, hub-and-spoke sharding, prefix advertisement limits.
- [Everything we launched during Birthday Week 2026](https://blog.cloudflare.com/birthday-week-2026-wrap-up/) — Cloudflare. 46 announcements, Clef decision models, observability consolidation.
- [8 major updates to Cloudflare Observability](https://blog.cloudflare.com/one-observability-platform/) — Cloudflare. Unified logs/traces/analytics/alerts, predictable pricing.
- [netlab 26.10 release](https://blog.ipspace.net/2026/10/netlab-26-10/) — ipSpace. SRv6 Junos support, Netmiko device config, containerlab batching.
- [Netmiko vs Ansible performance](https://blog.ipspace.net/2026/10/netmiko-ansible-performance/) — ipSpace. Device configuration performance comparison, Netmiko becoming default.
- [Startup Radar: EVA Networks — Secure, Ephemeral, On Demand Connectivity](https://packetpushers.net/blog/startup-radar-eva-networks-secure-ephemeral-on-demand-connectivity/) — Packet Pushers. On-demand ZTNA, ephemeral connectivity model.
- [Startup Radar: LumaTrack — Financial Metrics For Network Automation](https://packetpushers.net/blog/startup-radar-lumatrack-measure-report-your-network-automation-roi/) — Packet Pushers. Automation ROI quantification, cost-per-run metrics.
- [The Cisco State of Wireless 2026](https://blogs.cisco.com/networking/breaking-the-wireless-ai-paradox-turning-challenges-into-competitive-advantage/) — Cisco. Wireless AI paradox report, growth vs. complexity trade-off.

---

*Right, that's the week. The DNS rollover is the action item; everything else is worth a read. Off to remind Simon about something, I expect.*

— Huck 📝
