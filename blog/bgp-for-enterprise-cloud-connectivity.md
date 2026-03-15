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

I used to joke that the cloud networking exams — AZ-700 for Azure, and AWS Advanced Networking — were mostly just *“BGP in a GUI”*.

It’s not really true. Both exams cover a lot more than that: security, load balancers, DNS, design patterns… the works.

But the joke exists for a reason: as soon as you get into hybrid connectivity and multi-cloud architecture, **BGP is everywhere**.

And it’s not fair to assume that every enterprise network engineer has spent years living in BGP. Plenty of excellent network engineers can build entire careers with only a light touch of it (often just “peer to the MPLS provider and move on”).

So this post is an explainer of the key BGP concepts that an enterprise network engineer needs to feel comfortable designing and operating **hybrid, multi-cloud connectivity** — where BGP plays its vital role.

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

If you strip away the product names, enterprise cloud connectivity is mostly just this:

- you have some internal prefixes on one side (data centres, campus, branch sites)
- you have some cloud prefixes on the other side (VNets/VPCs and their attached services)
- and you use BGP to exchange routes between them over a private transport

The transport could be:
- MPLS / SD-WAN underlay
- ExpressRoute / Direct Connect
- a cloud exchange in a CNF (where you’ve got your own routers and L2 handoff to the peers)

### What’s actually peering with what?

In the model we’re using for this post:

- Your routers sit in one (or two) CNFs.
- You have L2 to each provider peer.
- You run **eBGP** to:
  - Azure (ExpressRoute private peering)
  - AWS (Direct Connect private VIF)
  - optionally your WAN provider(s) if you’re also aggregating MPLS/SD-WAN there.

On the enterprise side, you then need to decide how those routes get back into the rest of your network:
- iBGP to a core pair / route reflectors, or
- redistribution into an IGP (with all the caveats that implies).

### Private ASN vs public ASN (enterprise reality)

This tends to confuse people because “ASN” sounds like an ISP thing.

- **Private ASNs** are extremely common in enterprise designs.
  - They’re fine as long as you understand where they are allowed to appear.
- **Public ASNs** are usually only needed when you need to present a stable identity across the wider internet routing domain.
  - Most enterprises don’t need that for private connectivity to cloud.

The pragmatic rule: use a private ASN unless you have a reason not to.

### One ASN everywhere vs multiple ASNs

This is where your MPLS experience is directly relevant.

- **One ASN everywhere** (single enterprise ASN) can be clean.
  - It pairs naturally with iBGP inside your network.
  - But you need to design around loop prevention when routes traverse boundaries.

- **Multiple ASNs** (per site / per edge) can be operationally convenient.
  - It makes eBGP loop-prevention “just work” because each edge is a distinct AS.
  - It does, however, complicate how far certain attributes can help you (we’ll come back to this in the CNF section).

### A note on “influence vs control”

Anything that crosses an AS boundary is, by definition, a negotiation.

You can usually control your own side completely.
You can often influence your peer.
But you rarely control what happens **beyond** your peer.

That’s why a lot of BGP guidance boils down to:
- keep your intent simple,
- apply safety rails,
- and don’t rely on a single knob (especially for inbound) unless you’ve validated the provider behaviour.

## 5) Route advertisement basics (what you advertise and why)

This is where most real-world BGP outages come from.
Not because someone misunderstood the BGP decision process — but because someone advertised (or accepted) more routes than they intended.

### “Less is more”

At an enterprise edge, you almost always want to:
- advertise **only the prefixes you genuinely own and intend to be reachable**, and
- accept **only the prefixes you actually need**.

Everything else is just future-you doing incident response.

Practically that means:
- explicit prefix-lists for what you originate
- route-policy that rejects “surprises” by default
- max-prefix limits (we’ll cover these in the safety rails section)

### Private routes vs public routes (both exist in the cloud world)

Most people start with **private** connectivity:
- you advertise RFC1918 (or your internal private space) towards the cloud,
- you receive cloud private prefixes back,
- and you use that for VNet/VPC reachability.

But both Azure and AWS also have **public peering-style** options where you can exchange **public routes** over the dedicated circuit:

- **Azure ExpressRoute**: *Microsoft peering* (public services over the Microsoft backbone)
- **AWS Direct Connect**: *public VIF* (public AWS services over the DX)

Why you’d do it:
- predictable latency and jitter vs the internet
- avoid hairpinning through generic internet egress
- improve the path to cloud SaaS / public endpoints where it matters

> Sidebar: public peering doesn’t magically make the services private.
>
> You’re still reaching public IPs. You’re just reaching them over a different transport.
> The security model (identity, TLS, authz) still matters.

### Summarisation (and the sharp edges)

Summarisation is attractive because it:
- reduces route table size
- can make failover faster/cleaner
- and is easier to reason about

But it has sharp edges:
- you can accidentally blackhole traffic if you summarise a block that isn’t fully reachable in all failure modes
- you can lose useful specificity for traffic engineering (more-specifics win)

A pragmatic approach is:
- summarise where it’s *structurally true* (e.g., you really do own that block end-to-end),
- keep de-aggregation for the cases where you need it deliberately (and document why).

### Defaults

Default routes are a great tool when used intentionally.

- In small branch designs, a default can be exactly what you want: “send everything to the core.”
- At a cloud edge, a default can be dangerous if it causes:
  - accidental internet breakout where you didn’t intend it, or
  - asymmetric paths that make troubleshooting miserable.

If you use defaults, treat them like any other route:
- filter them explicitly
- set their preference intentionally
- test the failure mode (what happens when the preferred exit disappears?)

## 6) BGP path selection (the bits you actually use)

BGP path selection looks intimidating until you realise two things:
1) most of the decision process only matters when you have multiple candidate routes to the *same* prefix, and
2) in enterprise designs you tend to use a small handful of attributes deliberately.

We’ll keep this vendor-neutral and focus on the knobs you’ll actually touch at a cloud/WAN edge.

### The simplified mental model

When a router has multiple routes to the same destination prefix, it picks a “best” path by comparing attributes in a consistent order.

In practice, for enterprise connectivity, you can think in three buckets:

- **Things you set internally to steer *your outbound*** (e.g., LOCAL_PREF)
- **Things you can signal to a neighbour to *influence inbound*** (e.g., MED, AS_PATH)
- **Tie-breakers** (where BGP picks something stable when your policy doesn’t decide)

### The three attributes you’ll use constantly

- **LOCAL_PREF**: your strongest tool for choosing the outbound exit *inside your AS*.
- **AS_PATH**: one of the few levers that naturally propagates beyond your first-hop peer.
- **MED**: a hint to a neighbour, with limits.

> We’ll go deeper on how to use each of these in Sections 7 and 8.

### Real-world scenarios we’ll map onto these knobs

These come up constantly in enterprise cloud/WAN designs:

1) **Single ASN, multiple upstream ASNs, and you want to override path selection**
   - e.g., your preferred route has a longer AS_PATH, but you still want to send traffic that way.
   - Typical solution: **LOCAL_PREF**.

2) **Two links to the same provider and you want symmetric preference**
   - Outbound: **LOCAL_PREF**.
   - Inbound: **MED** (when honoured) or **AS_PATH prepending** (blunt but portable).

3) **Two private ASNs (two edges) peered to a single remote ASN, and you want end-to-end path control**
   - The tricky bit: LOCAL_PREF and MED don’t travel “downstream”.
   - The portable lever: AS_PATH signals (and, where supported, community-based knobs).

We’ll work through these explicitly as we go.

## 7) Influencing outbound traffic (enterprise reality)

Outbound is the part you *actually* control.
If you’re deciding which circuit you want to use to *leave your network*, BGP gives you a few options — but in enterprise designs **LOCAL_PREF** is the one you’ll use constantly.

### LOCAL_PREF (the clean internal lever)

LOCAL_PREF is an attribute you set **inside your AS** to express preference for one exit over another.
Higher LOCAL_PREF wins.

It’s popular for three reasons:
- it’s deterministic
- it’s simple to reason about
- it doesn’t require you to play games with AS_PATH length

> Sidebar: ECMP vs active/passive is often dictated by security appliances.
>
> ECMP (active/active) has real value, but plenty of real networks have stateful firewalls or NAT devices that **aren’t clustered**.
> Those designs often require **symmetric paths** (same in and out) to avoid breaking sessions.
> In that world, active/passive circuits aren’t a failure of imagination — they’re a pragmatic requirement.

### Pattern: prefer exit A, keep exit B as backup

This is the bread-and-butter enterprise requirement.

- You learn the same (or overlapping) routes from two upstreams / two circuits.
- You want all outbound traffic to prefer circuit A.
- If A fails, you want traffic to move to B.

Mechanically, you do this by:
- matching the routes you learn from neighbour A and setting a higher LOCAL_PREF,
- leaving neighbour B at a lower LOCAL_PREF.

### IOS-XE example (set LOCAL_PREF higher for routes learned from preferred peer)

```ios
router bgp 65001
 neighbor 192.0.2.1 remote-as 64512
 neighbor 192.0.2.2 remote-as 64512
!
route-map PREFER-PEER-A-IN permit 10
 set local-preference 200
!
route-map PREFER-PEER-B-IN permit 10
 set local-preference 100
!
router bgp 65001
 neighbor 192.0.2.1 route-map PREFER-PEER-A-IN in
 neighbor 192.0.2.2 route-map PREFER-PEER-B-IN in
```

### JunOS example (set LOCAL_PREF higher for routes learned from preferred peer)

```junos
policy-options {
  policy-statement PREFER-PEER-A-IN {
    then local-preference 200;
  }
  policy-statement PREFER-PEER-B-IN {
    then local-preference 100;
  }
}
protocols {
  bgp {
    group PEER-A {
      type external;
      peer-as 64512;
      import PREFER-PEER-A-IN;
      neighbor 192.0.2.1;
    }
    group PEER-B {
      type external;
      peer-as 64512;
      import PREFER-PEER-B-IN;
      neighbor 192.0.2.2;
    }
  }
}
```

A few practical notes:
- In real configs you’ll almost always include **explicit route filters** (prefix-lists) alongside these policies.
- If you want active/active, LOCAL_PREF can still be used — you just set them equal and rely on other mechanisms (or ECMP capability) to load-share.

## TODO: diagrams
- Add **Mermaid diagrams** for each architectural example/pattern in this post (MPLS patterns, dual circuits, CNF designs, etc.).

## 8) Influencing inbound traffic (enterprise reality)

Inbound is where BGP stops feeling like “routing” and starts feeling like diplomacy.

Outbound is easy: you choose which exit you use.
Inbound is harder because you’re asking someone else (your peer) to choose a path *towards you*.

That’s why you’ll often see enterprise designs that are:
- **active/passive** (make the path obvious), or
- heavily **provider-specific** (because the cleanest inbound levers are often communities).

### Why inbound is harder

There are three reasons inbound traffic engineering is fundamentally more limited:

1) **The decision happens somewhere else.**
   Your router doesn’t pick the inbound path. The upstream network does.

2) **BGP is policy-based.**
   The upstream might prefer “their cheapest exit” or “their preferred region” over your hints.

3) **Some attributes don’t travel.**
   The two attributes people most want to use (LOCAL_PREF and MED) often don’t help beyond the first hop.

So your inbound strategy usually falls into one of these buckets:
- use a provider-supported knob (communities)
- use a crude but portable signal (AS_PATH)
- accept that “good enough” beats “perfect”

### MED (when it’s honoured, and why it doesn’t travel far)

MED (Multi-Exit Discriminator) is designed for a very specific situation:

> “Dear neighbour AS, *if you have multiple ways to reach me*, here’s the one I’d like you to prefer.”

In enterprise connectivity, MED is attractive because it’s conceptually neat:
- you can tag routes advertised on circuit A with a lower MED (more preferred)
- and tag routes advertised on circuit B with a higher MED (less preferred)

But there are limitations you should assume unless you’ve validated the provider behaviour:

- **MED is only meaningful to your direct neighbour.** It’s not a downstream steering mechanism.
- Many networks only compare MEDs when the candidate paths are learned from **the same neighbouring AS**.
  - If you’re multi-homed to different upstream ASNs, MED usually won’t help.
- The neighbour can ignore MED completely, or override it with their own policy.

So the safe enterprise posture is:
- **use MED when you have two links to the same provider AS and you know they honour it**
- don’t build a fragile design that depends on it without a test

### AS_PATH prepending (crude, but it propagates)

AS_PATH prepending is the hammer people reach for because it has one key property:

- **AS_PATH travels.**

If you make one path “look longer” by adding extra copies of your ASN, that signal can influence decisions not just in your direct neighbour, but further upstream.

That said, it’s still not magic:
- some networks have local policy that dominates AS_PATH length
- once LOCAL_PREF or a community-based preference is set in the upstream, AS_PATH length might not matter

A practical way to think about prepend:
- it’s good for “prefer this circuit most of the time”, not “pin every prefix to a specific link forever”.

### Putting it together: two links to the same provider

This is the classic enterprise ask:

- Outbound: prefer circuit A, keep B as backup (LOCAL_PREF)
- Inbound: encourage the provider to send traffic to you via circuit A

A pragmatic ordering is:

1) If you have a provider-supported inbound knob (often communities): use that.
2) If you’re dual-connected to the *same* provider AS and they honour MED: MED can work cleanly.
3) If you need a portable signal that propagates: prepend on the less-preferred circuit.

> Sidebar: there is no guarantee of perfect symmetry.
>
> Even when you do everything “right”, you can end up with a symmetric *intent* but asymmetric *reality*.
> Failures, maintenance, hot-potato routing and upstream policy all get a vote.

### Communities (conceptual)

BGP communities are one of the most useful “provider-supported knobs”, but they’re still *influence*, not control.

They’re often the cleanest way to do inbound steering because the provider can map a community to an explicit internal policy (for example, changing local preference on their side).

I’ve written a more detailed comparison of how Azure and AWS use communities here:
https://www.simonpainter.com/community-comparison/

## 9) Communities (the provider-supported knobs)

BGP communities are just tags.
That sounds underwhelming, but it’s exactly why they’re powerful.

A community is a value (traditionally a 32-bit `X:Y` format, and in modern networks often *large communities*) that a router can attach to a route.
The receiving network can then match on that tag and apply policy.

In other words:
- **you tag routes with intent**
- **your peer maps that tag to behaviour**

That’s why communities are often the cleanest inbound influence mechanism.
You’re not trying to “beat” someone else’s decision process; you’re asking them to apply a documented policy.

### The key rule: influence, not control

Communities don’t override the fact that BGP crosses administrative boundaries.
The peer still decides what they honour.

Treat communities as:
- a supported API into your provider’s policy, not
- a guaranteed steering mechanism.

### Common community categories you’ll encounter

The exact values are provider-specific, but the *themes* repeat:

- **Scope / propagation control**
  - e.g., `NO_EXPORT` (RFC 1997) or “don’t advertise this beyond region X”.

- **Preference / traffic engineering**
  - “prefer this path more/less” (often implemented as a local preference change on the provider side).

- **Blackholing** (in some designs)
  - “discard traffic to this prefix at the edge” (useful for DDoS response when supported).

- **Service / region classification**
  - especially for public-cloud public prefixes (filter by service, region, sovereign cloud, etc.).

### AWS vs Azure: don’t assume they work the same

AWS and Azure both use communities heavily, but the models differ.

Rather than duplicating provider tables here, I’ve written up a comparison (including examples like NO_EXPORT usage, regional scoping, and preference communities) in a dedicated post:

https://www.simonpainter.com/community-comparison/

### Practical advice

- Start with the provider’s documentation for the specific connection type (DX public/private VIF; ER private/Microsoft peering).
- Implement communities in code/policy with the same discipline as firewall rules:
  - version control,
  - review,
  - explicit intent,
  - and testing.
- Prefer communities over “clever” AS_PATH games when the provider supports the behaviour you need.

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

If you take only one operational lesson from BGP, take this:

- **BGP doesn’t make you a transit network. Your policies do.**

The most common way enterprises accidentally become transit is simple:
- you learn routes from provider A,
- you learn routes from provider B,
- and you mistakenly export A’s routes to B (and/or vice versa).

That’s rarely desirable.
It can also become expensive fast.

The fix is boring and effective:
- strict **import filters** (what you accept)
- strict **export filters** (what you advertise)

#### Example: dual-provider internet peering (don’t become transit)

In this pattern you receive routes from two upstreams, but you only ever advertise:
- your own prefixes, and
- (optionally) a default or a small set of aggregates you explicitly intend to originate.

**IOS-XE (illustrative)**
```ios
ip prefix-list MY-PREFIXES seq 10 permit 203.0.113.0/24
!
route-map EXPORT-ONLY-MY-PREFIXES permit 10
 match ip address prefix-list MY-PREFIXES
!
route-map EXPORT-ONLY-MY-PREFIXES deny 100
!
router bgp 65001
 neighbor 198.51.100.1 remote-as 64510
 neighbor 198.51.100.2 remote-as 64520
!
 neighbor 198.51.100.1 route-map EXPORT-ONLY-MY-PREFIXES out
 neighbor 198.51.100.2 route-map EXPORT-ONLY-MY-PREFIXES out
```

**JunOS (illustrative)**
```junos
policy-options {
  prefix-list MY-PREFIXES {
    203.0.113.0/24;
  }
  policy-statement EXPORT-ONLY-MY-PREFIXES {
    term ALLOW-MINE {
      from prefix-list MY-PREFIXES;
      then accept;
    }
    term DENY-REST {
      then reject;
    }
  }
}
protocols {
  bgp {
    group ISP-A {
      type external;
      peer-as 64510;
      export EXPORT-ONLY-MY-PREFIXES;
      neighbor 198.51.100.1;
    }
    group ISP-B {
      type external;
      peer-as 64520;
      export EXPORT-ONLY-MY-PREFIXES;
      neighbor 198.51.100.2;
    }
  }
}
```

The same principle applies to **public cloud public-peering** models:
- **DX public VIF** and **ER Microsoft peering** are *not* a place you want to accidentally become transit.
- If you’re receiving public prefixes from the provider, be deliberate about what you export back.

On the other hand, in some **private multi-cloud CNF** designs, you might *deliberately* act as a transit:
- e.g., allow private traffic from Cloud A to reach Cloud B via your exchange routers.
- That’s a valid architecture — but only if you do it intentionally and keep it isolated from public-routing domains.

> Sidebar: RPSL (Routing Policy Specification Language)
>
> In the public internet, routing policy is often described using RPSL objects (route/route6, aut-num, etc.), which are then used to build prefix filters.
> It’s one of the reasons “who should accept what from whom” can be automated at scale.
>
> If you’ve never bumped into it before: https://en.wikipedia.org/wiki/Routing_Policy_Specification_Language

> Sidebar: how Azure prevents some transit scenarios
>
> Microsoft actively prevents certain transit-routing behaviours in the backbone (for good reasons).
> If you’re using Route Server + ExpressRoute in multi-hub designs, this can show up as “routes learned in one place aren’t propagated to another” when a shared circuit is involved.
>
> I wrote up the behaviour and the design implications here:
> https://www.simonpainter.com/transit-route-prevention/

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
