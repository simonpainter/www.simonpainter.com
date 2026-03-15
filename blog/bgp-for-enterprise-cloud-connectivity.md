---
title: "BGP for Enterprise Cloud Connectivity"
authors: simonpainter
tags:
  - networks
  - bgp
  - cloud
  - azure
  - aws
date: 2026-03-15
draft: true
---

BGP is the control plane that makes Direct Connect and ExpressRoute work.

If you only ever touched BGP at an MPLS edge, you can still run successful cloud connectivity — but you need a better mental model of **what BGP is doing**, **how attributes affect path selection**, and **which knobs actually influence inbound vs outbound**.

<!--truncate-->

## 1) What BGP is (in one page)

BGP is a *path-vector* routing protocol. You don’t “discover the best path” by calculating the shortest path through a topology (like you do with link-state protocols). Instead, you **learn candidate paths** via advertisements, then you **select** between them using a predictable decision process.

BGP is also **policy-first**. It’s designed for environments where “best” isn’t purely a function of link cost; it’s driven by *business relationships*, *operational preferences*, and *intent*.

> Sidebar: “BGP isn’t an IGP”… except when it is.
>
> In most enterprise networks, BGP isn’t used as an IGP. But at very large scale (I’ve seen this first-hand at Walmart), some organisations do run BGP internally because the scaling and operational trade-offs can work out better than running a giant link-state domain.
>
> If you want the deeper reasoning: I wrote about OSPF scaling constraints and why BGP scales differently here:
> https://www.simonpainter.com/dijkstra-ospf/

## 2) eBGP vs iBGP (what matters at the cloud edge)

There are two flavours of BGP in day-to-day designs:

- **eBGP** (external BGP): between different autonomous systems.
- **iBGP** (internal BGP): between routers *inside* the same autonomous system.

If you’ve only ever "touched BGP" at an MPLS edge, you’ve almost certainly only seen **eBGP**.
Cloud connectivity tends to drag iBGP into the conversation because you suddenly have **multiple edges** (two routers, two sites, two CNFs, two clouds) and you need consistent policy and predictable failover.

### eBGP

eBGP is what you run between your network and someone else’s.

In enterprise cloud connectivity that usually means:
- your router in a CNF peering with an **ExpressRoute** MSEE or **Direct Connect** router,
- your router peering with an ISP,
- your router peering with a managed MPLS provider PE.

The important enterprise mental model is: **eBGP is where the AS boundary is real**.
Across that boundary you can exchange routes, and you can *influence* the other side, but you don’t get to enforce how they do their internal routing.

### iBGP

iBGP is what you run when you have multiple routers in **the same ASN** that need to share BGP-learned routes with each other.

In the simplest cloud edge, you might not need iBGP at all (one router, one peering).
As soon as you add redundancy, iBGP becomes the clean way to make your edge behave like a single logical system:

- Two edge routers in the same site (active/active)
- Two CNFs (diverse meet-me rooms)
- Two provider circuits (separate peers)
- Two clouds (Azure + AWS)

You *can* avoid iBGP by doing weird things (like re-advertising routes between eBGP peers and hoping loop prevention doesn’t bite you), but iBGP is usually the right tool.

> Note: this is where people start hearing about route reflectors.
>
> You don’t need them in a small design, but once you have “lots of BGP speakers”, full-mesh iBGP becomes annoying because iBGP requires every router to peer with every other router (or you introduce route reflection/confederations).

### Why you care

Because **your operational knobs behave differently depending on where you are**:

- **LOCAL_PREF** is your best “pick the outbound exit” tool, but it’s **only meaningful inside your AS**.
- **MED** is, at best, a **hint to a neighbour** and typically only compared in narrow conditions.
- **AS_PATH prepending** is crude, but it’s one of the few signals that naturally propagates beyond your first-hop peer.

If you understand the eBGP/iBGP boundary, the rest of BGP becomes much less mysterious.

## 3) Where enterprise engineers have seen BGP before: MPLS WAN patterns

For a lot of enterprise folks, “BGP experience” starts and ends with *an MPLS circuit*.
That’s fine — but it can leave you with some slightly warped assumptions, because MPLS providers can make BGP look like anything from “a normal eBGP peer” to “a magic ethernet cable between sites”.

### Managed CEs (you might never have seen the BGP config)

Plenty of enterprises buy **managed CE routers**. In that model:
- the provider owns the config,
- you may only see a handoff (LAN interface / VLAN),
- and you might never touch BGP at all.

Mechanically, BGP is still often involved somewhere — it’s just **not your problem** until the day you add cloud connectivity and suddenly it is.

### Common MPLS patterns (abstract mechanics)

There are a few common ways MPLS WAN providers present routing. The exact implementation varies (VRFs, MP-BGP in the core, route targets, etc.), but the *customer-visible* behaviours are pretty consistent.

#### Pattern A: PE/CE eBGP (provider AS visible)

This is the “textbook” model.

- Your CE runs **eBGP to the provider PE**.
- The provider PE is in **the provider’s ASN**, so you see the provider AS in the AS_PATH (or at least you *can*).
- Your routes are imported into the provider’s MPLS VPN routing domain and distributed to other sites.

Why this matters for the cloud journey: this is the closest mental model to DX/ER peering.

#### Pattern B (sidebar): CE–CE peering over MPLS (customer edges peer with each other)

> This is **not the typical MPLS model** — most MPLS WANs are built as a many-to-many L3VPN where you peer to the provider and the provider does the route distribution.
>
> That said, I *have* seen real-world deployments where the MPLS network is treated as **a transport underlay**, and the **customer edge routers form BGP adjacencies with each other**.
>
> What it looks like from the customer’s point of view:
> - Site A CE has BGP neighbours that are *other customer CEs*.
> - The provider ASN may not appear in the AS_PATH (because the provider isn’t acting as a BGP hop in your control plane).
>
> What has to be true for it to work:
> - The provider must provide **IP reachability between CEs** (it’s effectively giving you a routed any-to-any service), and
> - the provider is **not** doing your inter-site route exchange for you — *your BGP* is.
>
> This pattern is conceptually closer to “running your own WAN overlay” than to classic managed MPLS L3VPN routing.

### ASNs in MPLS enterprise designs

#### Per-site ASNs

A very common enterprise pattern is:
- each site has its own private ASN, or
- sites are grouped into a small pool of private ASNs.

It’s convenient because it keeps the eBGP loop-prevention behaviour simple: every site is “a different AS”, so re-advertisement between sites doesn’t trip over “I see myself in the AS_PATH”.

#### Single ASN across all sites (and why private-AS stripping matters)

It’s equally valid to run **the same ASN at every site**.

But you need to understand one hard rule:

- If site A advertises a prefix to the WAN, and that route is later presented to site B *with the same ASN still in the AS_PATH*, then **site B will drop it**.

That’s not a bug — that’s BGP doing loop prevention: *“I won’t accept a route that already contains my ASN.”*

So if you run “single ASN everywhere” using a private ASN, the provider typically has to do **private-AS removal/stripping** between sites.

This exact idea shows up again in cloud connectivity designs when you’re deciding whether to use one ASN globally, or split ASNs per edge/site.

## 4) Peering relationships in enterprise cloud connectivity

(TODO: on-prem edge ↔ exchange/provider ↔ cloud; private vs public ASN realities)

## 5) Route advertisement basics (what you advertise and why)

### “Less is more”
(TODO)

### Summarisation (and the sharp edges)
(TODO)

### Defaults
(TODO)

## 6) BGP path selection (the bits you actually use)

(TODO: high-level decision flow — keep it practical and focus on attributes we’ll touch later)

## 7) Influencing outbound traffic (enterprise reality)

### LOCAL_PREF (the clean internal lever)
(TODO)

### IOS-XE example (LOCAL_PREF outbound preference)
```ios
! TODO
```

### JunOS example (LOCAL_PREF outbound preference)
```junos
# TODO
```

## 8) Influencing inbound traffic (enterprise reality)

### Why inbound is harder
(TODO: you’re asking someone else to choose differently)

### AS_PATH prepending
(TODO)

### MED (when it’s honoured, and why it doesn’t travel)
(TODO)

### Communities (conceptual)
BGP communities are one of the most useful “provider-supported knobs”, but they’re still *influence*, not control.

I’ve written a more detailed comparison of how Azure and AWS use communities here:
https://www.simonpainter.com/community-comparison/

## 9) Communities (the provider-supported knobs)

(TODO: keep conceptual; point to AWS/Azure docs and the comparison post above)

## 10) Cloud exchange / carrier neutral facility (CNF) patterns

A cloud exchange is typically a **carrier neutral facility (CNF)** where you can aggregate:
- cloud provider connectivity (ExpressRoute / Direct Connect)
- WAN connectivity (MPLS / SD-WAN)

Assumption for the examples in this post:
- you host **your own routers** in the exchange, and
- the exchange provides **L2** to each cloud peer (so you run BGP directly with the cloud/provider routers).

### Two-CNF diversity and ASN choices

#### Option A: single ASN across both CNFs
(TODO: explain path selection options)

#### Option B: dual private ASNs (one per CNF)
(TODO: explain why LOCAL_PREF and MED are AS-local / limited; why prepend is downstream-visible)

## 11) Safety rails (the section that saves outages)

### Prefix-lists / route filtering
(TODO)

### Max-prefix
(TODO)

### Route refresh / soft reconfig basics
(TODO)

## 12) Cloud specifics (light touch)

### What’s different for DX/ER vs MPLS peering
(TODO)

### Route Server (brief pointer)
(TODO: link to existing posts)

## Conclusion

(TODO)
