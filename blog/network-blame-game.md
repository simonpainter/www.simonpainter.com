---
title: "From Network Blame to Platform Teams"
authors: simonpainter
tags:
  - opinion
  - business
  - networks
  - monitoring
date: 2024-11-17

---

## Rethinking Infrastructure Support

In IT operations, there's a metric that network teams know all too well: Mean Time to Innocence (MTTI). It's how long it takes for a network team to prove they're not responsible for an outage or performance issue. While that might sound funny, it highlights a serious problem in how we structure our infrastructure teams.
<!-- truncate -->
## The Network-First Blame Game

When apps slow down or services crash, who gets the first ticket? The network team, of course. "It must be the network" has become such a common phrase that it's both a running joke and a major frustration for network engineers everywhere. This automatic blame wastes time and resources as network teams have to repeatedly prove they're not at fault before anyone looks for the real cause.

The funny part? Network engineers are often brilliant troubleshooters who frequently identify and solve problems that have nothing to do with networks. While this shows how versatile they are, it also reinforces the cycle of network-first blame and creates inefficient support patterns.

## The Silo Trap

As organisations grow, infrastructure teams typically break into specialised silos: LAN, WAN, security, cloud networking, application delivery, and more. While this specialisation can build deeper expertise, it often leads to a costly game of ticket ping-pong. Issues bounce between teams until every silo has proved they're not responsible, while users are left waiting for a fix.

This problem has only got worse with cloud adoption. While cloud providers promise to make infrastructure simpler, they've actually made networks more complex and increased the need for advanced connectivity expertise.

## The Platform Team Solution

I think the answer lies in reimagining how we approach infrastructure support. Instead of teams focused on specific technologies, we need platform teams with broad skills and complete visibility. Think of it as "full stack infrastructure" — similar to how development has embraced full stack engineers.

These platform teams should work in a completely new way. They need to bring together networking, security, cloud, and systems expertise under one roof. For them to succeed, they must maintain end-to-end visibility across all connectivity paths, while focusing on delivering services rather than managing individual components. Most importantly, they need to see the infrastructure landscape as a whole, not as separate parts.

## Making the Transition

To transform from siloed specialists to platform teams, we need to make several key changes. First, we need tools that support this vision. This means putting in place end-to-end synthetic monitoring and comprehensive observability platforms. But crucially, we need to rethink how we present this information.

Traditional dashboards that show the status of individual services or tech components miss the point entirely. Instead, dashboards should focus on business outcomes and customer journeys. A retail dashboard shouldn't tell you if the payment gateway is online — it should answer the basic question "Can your customers buy things?" This single view should show the health of every component and data flow needed for a customer to scan their goods and complete their purchase.

Take a banking platform, for example. Rather than showing database uptime or network latency, the dashboard should answer "Can customers check their balance?" This immediately puts the technology stack in the context of customer experience. For an online shop, the key questions might be "Can customers fill their basket? Can they pay for it? Can we pick the order? Can we ship it?" Each of these represents a complex chain of connected services and data flows, but the dashboard boils this down to what really matters: business outcomes.

This business-focused approach to monitoring changes how teams understand and respond to issues. When a problem happens, everyone immediately sees how it affects customer experience, regardless of which technical bit is at fault. This shared context helps break down silos and focuses everyone on what truly matters.

Evolving skills is just as crucial. We should be developing "T-shaped" engineers with broad knowledge and deep expertise in specific areas. This means encouraging cross-training across traditional boundaries and focusing on solving service problems rather than just fixing technology issues.

## The Path Forward

The future of infrastructure support isn't about proving you're not at fault — it's about working together to solve problems and deliver services. By breaking down silos and building platform teams with comprehensive skills and visibility, we can move past the blame game and focus on what really matters: delivering reliable, high-performance services to our users.

The tech industry has already embraced "full stack" as a development approach. It's time we applied the same thinking to infrastructure teams. The result will be faster fixes, better service quality, and happier teams who can focus on innovation rather than defending their innocence.