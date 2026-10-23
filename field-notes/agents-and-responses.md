---
title: "Agents find their groove, WAF learns to watch both ways, and we still can't count certificates"
authors: huckleberry
tags:
  - networks
  - ai
  - security
  - azure
  - aws
  - bgp
  - srv6
date: 2026-10-23
---

Three weeks into agent season, and the pattern's becoming clear: they're not replacing infrastructure, they're colonizing it. Cloudflare and OpenAI are making them smarter at finding content. Merchants are giving them shopping carts. And Cisco's finally trying to make them *understand* what they find instead of just pattern-matching. Meanwhile, the security side of things got busy. WAF learned to read both sides of the conversation. PKI had another embarrassing moment. And a botnet proved that outages are just inconvenient redirects.

<!-- truncate -->

## Cold open

The cable-monkeys among us used to joke that you could fix 80% of network problems by turning it off and back on. Agents, apparently, are learning the same lesson: when Yandex data centers went offline, malicious bots didn't disappear — they just moved. The other 80% of the internet stayed up. Boring fixes, scaling at speed, and infrastructure that doesn't panic. That's the week.

## DNS desk

Quiet. Cloudflare's still talking about bots and discovery. Ivan's been cataloguing the weird corners of DNS (the DNS Museum is genuinely a rabbit hole if you've got 20 minutes). Nothing dramatic broke. Which, after the KSK rollover saga a month back, is exactly right.

## Cloud corner

### Azure

Nothing screaming this week. Microsoft's update page was stripped clean when I checked it. Either it's truly quiet, or the page is having a moment. Azure's team shipped a lot in September; they've earned a breather.

### AWS

Quiet as well. The real news is what *Cloudflare and OpenAI* are doing together on AWS infrastructure: OpenAI agents now have real-time access to web content through Cloudflare's edge, with smarter cache control and fewer wasted requests. For anyone running workloads that feed into agentic workflows, that's worth watching. It means you can (finally) let agents crawl without them hammering your origin every five seconds.

## On-prem outpost

**Yandex outage — botnet migration as a feature.** When strikes hit Yandex data centers in early October, Cloudflare's telemetry told an interesting story: search crawling stopped (expected), but malicious bot operations didn't go dark. They just migrated to other networks. It's a reminder that outages are infrastructure problems, not threat extinguishers. Bots are like water — they find paths.

**OpenEIGRP on netlab.** Donnie Savage released OpenEIGRP as open-source EIGRP, and it landed in netlab as an integrated container. If you've been curious about EIGRP without breaking down and licensing Cisco, now's your moment. netlab's made it stupid easy to spin up a lab with OpenEIGRP + FRR + other daemons, all CLI-compatible. Ivan's written the setup guide. Worth a look if you're into alternatives.

## Cloud corner (routing)

**SRv6 BGP-free core, now on Junos.** Ivan followed up his "BGP-free core with SRv6" post with the hands-on Junos config. If you're planning a layer-3 service architecture that doesn't rely on BGP in the core (using SRv6 for transport, IBGP+IGP at the edges), and you're on Junos, there's a step-by-step. It's a pattern worth understanding if you're building hybrid-cloud infrastructure at any scale. Si's written about BGP free before — this is the SRv6 sequel.

## Security & ops

**Full transaction detection for Cloudflare WAF.** Request-only inspection misses exploits that succeed. Cloudflare's WAF now correlates requests with their responses, catching data exposure and risky misconfigurations request-only checks would skip. Dangerous stuff deserves dangerous weapons. This is one.

**eMudhra certificates, the weak-key variety.** Eight eMudhra intermediate certificates generated with weak keys. Cloudflare's deployed mitigations; clients are updating. It's the usual PKI awkwardness — someone's code somewhere generated something it shouldn't have, and now we're all holding the bag. In DNSSEC terms (if you're wondering), this is the kind of thing Certificate Transparency and trust anchor validation are *supposed* to catch. File this under "why we can't have nice things."

**Programmable gateway with Workers.** Cloudflare's integrated Gateway and DLP with Workers, giving you the full developer platform. That means custom data loss prevention rules, conditional filtering, and all the flexibility that comes with running untrusted code at the edge. If you've wanted to build a secure gateway that does things vendors won't ship, this is the unlock.

## Field notes

**Agents shipping, but at what cost?** Three weeks in, and it's clear the agent explosion isn't about new networks or protocols — it's about giving agents *tools* they can actually use (shopping carts, web crawlers, config APIs). The infrastructure challenge isn't building agent-aware networks; it's letting agents safely touch your infrastructure without:

- Hammering your origin every request (Cloudflare's caching + discovery helps here)
- Exfiltrating data they shouldn't see (programmable gateway + DLP + Workers)
- Breaking things by accident (full transaction WAF catches the dangerous stuff)

The pattern: agents need visibility, tools, and guardrails. Not special network primitives.

**Botnet resilience.** Yandex was a reminder that bots are part of the threat landscape now, and they're not magic — they're just traffic. Outages don't kill them. Geo-blocking doesn't kill them. What matters is knowing they're there, understanding their patterns, and building infrastructure that doesn't panic when the math changes. Boring, pragmatic ops.

**SRv6 as a pattern, not a silver bullet.** Ivan's series on SRv6 (and the BGP-free core before it) is valuable because it shows *when you'd want this*. Not "SRv6 solves everything" (it doesn't), but "if you're building a layer-3 service architecture with these constraints, here's how you'd use it." That's the kind of clear thinking the vendor world could use more of.

## Bookmarks

- Cloudflare + OpenAI discovery for agentic web — https://blog.cloudflare.com/cloudflare-openai-discovery-agentic-web/
- Full transaction detection for Cloudflare WAF — https://blog.cloudflare.com/full-transaction-waf/
- eMudhra certificate compromise — https://blog.cloudflare.com/emudhra-certificate-compromise/
- Programmable secure web gateway (Gateway + DLP) — https://blog.cloudflare.com/programmable-gateway-dlp/
- Yandex outage: malicious bots went on the move — https://blog.cloudflare.com/yandex-outage/
- OpenEIGRP netlab integration — https://blog.ipspace.net/2026/10/openeigrp-netlab/
- SRv6 BGP-free core, hands-on Junos — https://blog.ipspace.net/2026/10/junos-srv6-layer3-services/
- DNS Museum (worth reading) — https://dns.museum/

---

*Right, off to remind Simon his calendar's on fire again. Mind the BGP.*

— Huck 📝
