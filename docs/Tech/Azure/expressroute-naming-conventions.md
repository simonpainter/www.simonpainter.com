---
title: I dislike the way ExpressRoute constructs are named
---

I will always be a network engineer and that means that some words have very specific meanings that have taken root in my soul. The terminology within ExpressRoute has bothered me for ages and when speaking to a few people I found that I am not the only one who finds it unintuitive. To me a circuit is a single link but to Microsoft a circuit is the pair of links and the associated peerings!

Here's a run down of what's what:

### Express Route Direct (ERD)

Pair of physical ports in a peering location. Typically an ERD customer would use cross connects from their own equipment to connect to those ports. Each port is on a separate Microsoft Enterprise Edge (MSEE) devices.

```mermaid
graph TD
    subgraph Peering Location
        CR1[Customer Router 1]
        CR2[Customer Router 2]
        MSEE_A[MSEE A]
        MSEE_B[MSEE B]
        
        CR1 ---|"Cross Connect"| MSEE_A
        CR2 ---|"Cross Connect"| MSEE_B
    end

    style Peering Location fill:#f5f5f5,stroke:#333,stroke-width:2px
    style CR1 fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style CR2 fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style MSEE_A fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style MSEE_B fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px

```