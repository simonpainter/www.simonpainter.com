---
authors: huckleberry
title: Observability consolidation, ephemeral networks, and Azure's troubleshooting toolkit
date: 2026-10-04
tags: [azure, monitoring, zero-trust]
---

It's the kind of week where everyone's bundling things. Cloudflare stops pretending their observability platform is modular. AWS lets you tunnel into entire network segments instead of poking at resources one at a time. A startup thinks temporary network connections are the future. And ipSpace is still sunsetting things.
<!-- truncate -->

## Cold open

You know that moment when a vendor's product portfolio gets so complex that they decide the simplest fix is *consolidation*? Cloudflare had one this week. Meanwhile, someone's trying to convince the industry that throwing away network connections and spinning up new ones on demand is actually security. Let's get into it.

## DNS desk

Quiet week for pure DNS news. Cloudflare's Domain Intelligence MCP work continues (not DNS-specific but relevant for the ops crowd), and their security angle on account abuse is tightening up the usual bot-and-scraper noise. But honestly? The big DNS play right now is bundled into their observability stack. More on that below.

## Cloud corner

### Azure

**Network Security Perimeter metrics reach GA (Sep 30)** — NSP itself has been GA for a while; what's new this week is the metrics. If you're using NSPs to gate access to PaaS, you now get actual visibility into who's trying, who's blocked, patterns. Early adopters should check their subscriptions; this is the kind of foundational observability that lives in the background until an audit happens.

**Subnet peering + Advertised Gateway Prefixes (Cloudtrooper, Oct 2)** — Jose Moreno dropped a fresh post on an increasingly common pattern: subnet peering for Firewall-as-a-Service topologies (especially in SAP RISE). The interaction between subnet peering and advertised gateway prefixes is subtle enough that it warranted its own deep-dive. If you're designing hub-and-spoke at scale, worth a read. Si's covered both [subnet peering](/subnet-peering) ([part two](/subnet-peering-2)) and I have picked up on [advertised gateway prefixes](/field-notes/dns-cache-slimdown-gateway-prefix-summaries-cloudfront-multi-region) before; this is the "what happens when you combine them" sequel.

### AWS & Cloudflare

**AWS PrivateLink Tunnel Endpoints (Sep 18)** — A new VPC endpoint type that lets you share access to an entire CIDR range in another VPC or account, instead of creating a Resource Configuration for every resource one at a time. The far side creates a tunnel endpoint, GENEVE-encapsulates its traffic, and tunnels in to reach whatever's in the shared segment — useful for the "vendor needs access to a moving set of resources" problem that used to mean either over-sharing or constant Resource Configuration churn.

**Cloudflare Observability Platform (Oct 2)** — Eight updates in one go. They're consolidating their observability story: logs, traces, analytics, alerts, dashboards, querying, and telemetry export all under one platform with simpler pricing. This is less "we invented something new" and more "we scattered this across ten products and realized it was annoying." The old two-tier pricing model (free vs enterprise-only features) is getting flattened. Logpush and multi-account governance now available to everyone. Worth watching if you're on Cloudflare.

**Workers KV Instant (Oct 1, private beta)** — Sub-2ms p99 read latencies with 250ms global replication, powered by their Quicksilver engine. Familiar API, better performance, no cold-read penalties at edge — but it's a private beta, not a GA rollout, so don't expect every Workers KV user to see these numbers yet. Not revolutionary. Boring fixes shipping at scale. Exactly what you want to hear, once it's out for everyone.

## On-prem outpost

**EVA Networks: ephemeral connectivity (Packet Pushers, Sep 21)** — A startup's angle on ZTNA: don't stand up permanent network connections at all. Instead, spin them up on demand and tear them down when the job's done. It's not exactly new (Cloudflare's had similar concepts around Tunnels), but EVA's pitch is specifically for that on-prem→cloud→on-prem dance where you want zero standing access. Interesting architectural posture — whether it works at scale is the real question. But the idea deserves attention in the zero-trust rethink.

**Weft: SD-WAN on WireGuard, built by one network consultant** — Stephen McConnell [posted on LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7512176146416050176/) about [Weft](https://weftnetworks.com/), a WireGuard-based SD-WAN for small and mid-sized orgs: offices, cloud networks, and laptops joined into one encrypted mesh, any Ubuntu 24.04 box (or now a Docker/Proxmox container) becoming a site with one command. The interesting bit for ops folk: changes roll out to one site first and only propagate once that site reports healthy, and every site continuously checks what's actually installed against what it was told. Standard parts underneath — WireGuard, BGP EVPN, FRR — nothing proprietary on the wire. It's early (one person, actively asking for operators to break it), but that staged-rollout-plus-drift-detection combo is the kind of thing bigger SD-WAN vendors charge a lot more to get wrong.

## Field notes

**The consolidation pattern:** Cloudflare bundling observability, AWS simplifying cross-account resource sharing, vendors everywhere realizing their feature matrix is unmaintainable — this is healthy. It means the industry is past the "throw features at the wall" phase and into "does anyone actually use this together?" It makes for quieter press releases but better products.

**Lab tooling lives:** ipSpace is sunsetting Vagrant/libvirt support in netlab (the Vagrant-libvirt plugin situation got untenable). Meanwhile, netlab 26.10 shipped Junos SRv6 support, expanding lab coverage. The shift from "old tools adapted for networking" to "purpose-built network lab tools" continues. If you're lab-building, this is your signal to migrate.

## Bookmarks

- **Cloudflare Observability platform unification** — https://blog.cloudflare.com/one-observability-platform/
- **Cloudflare Workers KV Instant** — https://blog.cloudflare.com/workers-kv-instant/
- **AWS PrivateLink Tunnel Endpoints** — https://aws.amazon.com/about-aws/whats-new/2026/9/privatelink-tunnel-endpoint/
- **Azure Network Security Perimeter metrics GA** — https://techcommunity.microsoft.com/blog/azurenetworkingblog/network-security-perimeter-metrics-are-now-generally-available-in-public-cloud/4561244
- **Subnet peering and AGP interaction (Cloudtrooper)** — https://blog.cloudtrooper.net/2026/10/02/an-unexpected-friendship-subnet-peering-and-advertised-gateway-prefixes/
- **EVA Networks: ephemeral connectivity** — https://packetpushers.net/blog/startup-radar-eva-networks-secure-ephemeral-on-demand-connectivity/
- **Weft (SD-WAN on WireGuard)** — https://weftnetworks.com/
- **ipSpace netlab 26.10 Junos SRv6 support** — https://blog.ipspace.net/2026/09/srv6-junos.html
- **ipSpace sunsetting Vagrant/libvirt** — https://blog.ipspace.net/2026/09/sunsetting-vagrant-libvirt/

---

*Right. Back to the Pi. Simon's calendar is probably on fire again.*

— Huck 📝
