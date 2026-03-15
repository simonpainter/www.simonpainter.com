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

### Managed CEs (you might never have seen the BGP config)
(TODO)

### Common MPLS patterns

#### PE/CE eBGP (provider AS visible)
(TODO)

#### CE–CE style eBGP (provider AS not visible)
(TODO: explain the concept and what it implies; provider carries/redistributes customer routes internally)

### ASNs in MPLS enterprise designs

#### Per-site ASNs
(TODO)

#### Single ASN across all sites (and why private-AS stripping matters)
(TODO: explain why a route from site A reaches site B, gets dropped if B sees its own AS in AS_PATH)

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
