---

title: "Vibe code project: Internet Map"
authors: simonpainter
tags:
  - personal
  - bgp
  - networking
date: 2026-04-19

---

I've always found the structure of the internet fascinating — not the web pages on top of it, but the physical and logical plumbing underneath. Every time you load a page, your packets travel across a patchwork of independent networks called **Autonomous Systems (ASes)**, each identified by an **ASN** (Autonomous System Number). The way these networks connect to each other — who peers with whom — is what I wanted to visualise.
<!-- truncate -->
## Where the data comes from

The internet's routing fabric is largely visible through the **BGP (Border Gateway Protocol)** routing tables held by public route servers. Projects like [RouteViews](http://www.routeviews.org) and [RIPE NCC's RIS](https://ris.ripe.net) run publicly accessible route servers that let anyone log in and dump the full global routing table.

A BGP route looks something like this:

*> 1.0.0.0/24 203.0.113.1 0 13335 15169 i


That trailing sequence — `13335 15169` — is the **AS path**: a record of every autonomous system the route advertisement travelled through to reach this vantage point. It's basically a breadcrumb trail across the internet.

I wrote a Python tool that connects to 76 public route servers (via Telnet and SSH), streams their full BGP tables, and parses out those AS paths. From a single run I collected **302,563 routes** from 30 reachable servers, revealing **17,621 unique ASNs** and **24,299 peering relationships**.

## Building the graph

Each AS path is processed to extract directed edges: if `13335` appears immediately before `15169` in a path, that's an edge `13335 → 15169`. The more routes that share an adjacency, and the more independent vantage points that see it, the stronger the edge weight.

The result is a [NetworkX](https://networkx.org) directed graph where:

- **Nodes** are ASNs, annotated with how many prefixes they originate and how often they appear in paths
- **Edges** carry a `weight` (route count) and `vantage_count` (how many route servers independently confirmed this peering)

The graph is exported to GraphML, GEXF, JSON, and CSV — useful for different downstream tools.

## The visualisation

With 17,000+ nodes, traditional SVG-based graph layouts grind browsers to a halt. Instead I used **D3.js with Canvas rendering** — drawing every node and edge directly to a `<canvas>` element each simulation tick, which keeps things smooth even at this scale.

The layout uses D3's force simulation:

- **Charge force** pushes nodes apart (repulsion)
- **Link force** pulls connected nodes together, with distance scaled inversely to edge weight — so heavily-trafficked peerings draw ASes closer
- **Collision force** stops nodes overlapping

Nodes are coloured by degree (number of direct peers):

| Colour | Tier |
|--------|------|
| 🔴 Red | Tier-1 hubs — degree ≥ 100 |
| 🟠 Orange | Major networks — degree 20–99 |
| 🔵 Blue | Mid-tier — degree 5–19 |
| ⚫ Grey | Leaf nodes — degree < 5 |

Node size scales with `observed_count` — how frequently an ASN appears anywhere in BGP paths — which is a reasonable proxy for how "central" a network is to internet routing.

The page is fully interactive: zoom, pan, click a node to highlight its neighbourhood, search by ASN, and filter out low-weight edges to reduce noise. The whole thing is a single self-contained HTML file (~2.7 MB with data embedded) that needs no server.

## What the graph reveals

The structure is unmistakably **scale-free** — a small number of ASNs have enormous numbers of peers (the well-known Tier-1 carriers: AS3356 Lumen/Level3, AS1299 Telia, AS6939 Hurricane Electric), while the vast majority are leaf nodes with just one or two upstream connections. This kind of hub-and-spoke topology is typical of networks that grow by preferential attachment, which is exactly how the internet has evolved organically over decades.

The denser core also shows clear **regional clustering** — European IXP participants cluster together, as do Asia-Pacific and Latin American networks — even though the layout algorithm has no geographic information at all. Connectivity patterns alone are enough to reveal geography.

## Exporting for print

The interactive view is great for exploring, but I also wanted a poster-quality output. The tool exports:

- A **3× high-resolution PNG** of whatever is currently on screen
- A **full vector SVG** sized to A3 landscape, with labels on all major hubs and a legend — suitable for opening in Inkscape or Preview and saving as a print-ready PDF

You can explore the [live version here](html/visualize_out.html).
