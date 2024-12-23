---
title: Dijkstra in OSPF
---

## Why Network Engineers Should Care About Dijkstra

If you've worked with OSPF, you've likely encountered mentions of Dijkstra's algorithm in documentation and training materials. However, these references often feel disconnected from the practical realities of network design. Today, we'll bridge that gap, exploring how this fundamental algorithm shapes the way we deploy and scale OSPF networks.

## What Actually Happens When OSPF Runs Dijkstra?

Each OSPF router maintains a detailed map of network topology through Link State Advertisements (LSAs). When it comes time to calculate routes, the router places itself at the root of a theoretical tree and begins evaluating paths to every known destination in the network. Starting with directly connected neighbours, it systematically calculates the cumulative cost to reach each destination.

Think of it like planning a journey where you continuously reassess the total cost of reaching each destination as you discover new potential paths. The router keeps track of the best path found so far to each destination, updating these paths as it discovers potentially better alternatives. This process continues until the router has found the optimal path to every destination in its topology database.

## Why This Matters for Your Network

Understanding Dijkstra's implementation helps explain why certain OSPF behaviours occur. When a link fails or a new router joins the network, every router must rerun these calculations. The processing time isn't linear—it increases exponentially with the number of routers in the network. This computational reality drives many of the design decisions we make daily, often without realising it.

## The Real Reason for OSPF Areas

We often discuss OSPF areas as a way to manage route summarisation and control LSA flooding. Whilst these are important benefits, the primary driver for areas is managing the computational overhead of Dijkstra's algorithm. When you're wondering why the traditional guidance suggests limiting areas to 50-100 routers, you're actually bumping up against the practical limits of running Dijkstra calculations at scale.

## Contrasting with Other Routing Protocols

This helps explain why BGP and EIGRP handle large networks differently. BGP doesn't use Dijkstra at all—it makes decisions based on path attributes and policies, more like following a recipe than solving a mathematical puzzle. EIGRP uses the Diffusing Update Algorithm (DUAL), which focuses more on maintaining backup paths than finding mathematically optimal routes.

## Practical Design Implications

Understanding Dijkstra's role should influence your design decisions in several ways:

When planning area boundaries, consider processing overhead rather than just network geography or organisational structure. Each router in an area must run Dijkstra calculations for the entire area's topology.

The recommendation to minimise the number of adjacencies per router isn't just about bandwidth—it's about managing the complexity of Dijkstra calculations.

Hub-and-spoke designs with a backbone area (Area 0) connected to smaller areas aren't just organisationally neat—they're mathematically efficient, limiting the scope of Dijkstra calculations.

## Looking Forward

As network hardware becomes more powerful, the processing overhead of Dijkstra's algorithm becomes less constraining. However, understanding these fundamental principles remains crucial for designing efficient and scalable networks. The next time you're planning an OSPF deployment, consider not just the visible design elements, but also the algorithmic forces shaping your choices.