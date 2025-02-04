---
title: I dislike the way ExpressRoute constructs are named
---

I will always be a network engineer and that means that some words have very specific meanings that have taken root in my soul. The terminology within ExpressRoute has bothered me for ages and when speaking to a few people I found that I am not the only one who finds it unintuitive. To me a circuit is a single link but to Microsoft a circuit is the pair of links and the associated peerings!

Here's a run down of what's what, starting with the wires and working up.

### ExpressRoute Direct (ERD)

Pair of physical ports in a peering location in the Microsoft Enterprise Edge (MSEE) and enable the physical fibre cross connects at layer 1 to the customer router. Prior to ERD being available as a product these would typically exist only in the form of a cross connect to service providers who offered ExpressRoute connectivity services, but are now offered direct to customers who have the requirement and the necessary supporting infrastructure.
Microsoft documents refer to these as ExpressRoute Direct *resources* to either add or remove confusion with [ExpressRoute Direct Circuits](#expressroute-direct-circuit).

```mermaid
flowchart TD
    subgraph PL[Peering Location]
        CR1[Customer Router 1]
        CR2[Customer Router 2]
        MSEE_A[MSEE A]
        MSEE_B[MSEE B]
        
        CR1 <--->|"Cross Connect ExpressRoute Direct Link"| MSEE_A
        CR2 <--->|"Cross Connect ExpressRoute Direct Link"| MSEE_B
    end

    style PL fill:#f5f5f5,stroke:#333,stroke-width:2px
    style CR1 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style CR2 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style MSEE_A fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style MSEE_B fill:#e1f5fe,stroke:#0288d1,stroke-width:2px

```

> ExpressRoute Direct resources are provided as a pair of ports in separate MSEE devices to ensure that maintenance outages or
> failures on a single MSEE do not cause loss of service. It is not possible to buy them with a single link.

ExpressRoute Directs are paired inside a single peering location except when they used in [ExpressRoute Metro](#expressroute-metro); in that case the separate [ExpressRoute Direct Links](#expressroute-direct-link) are supplied in two separate peering locations but still function as a pair.

### ExpressRoute Direct Link

Nominally a single port on the MSEE or a single fibre pair cross connect. These cannot be bought separately and are typically supplied in the same peering link, except where used for [ExpressRoute Metro](#expressroute-metro).

### ExpressRoute Direct Circuit

Exactly the same as an [ExpressRoute Circuit](#expressroute-circuit) however instead of being provided over a telco partner's infrastructure it's provisioned over an [ExpressRoute Direct](#expressroute-direct-erd) resource. A single ExpressRoute Direct resource can have multiple ExpressRoute Direct Circuits associated with it using 802.1q (vlan tagging) or 801.1ad (Q-in-Q tagging) to logically separate the layer 2 traffic.

### ExpressRoute Circuit

These are the logical constructs which encompasses two [ExpressRoute Links](#expressroute-link).

### ExpressRoute Link

Each [ExpressRoute Circuit](#expressroute-circuit) is made up of two links, these are the vlan tagged layer 2 connections between customer (or telco) managed equipment and the MSEE. T

### ExpressRoute Peering

#### Peering type: Azure private peering

Azure compute services, such as virtual machines (IaaS) and cloud services (PaaS), deployed within a virtual network can be connected through the private peering domain. This domain is considered a trusted extension of your core network into Microsoft Azure.

#### Peering type: Microsoft peering

Connectivity to Microsoft online services (Microsoft 365, Azure PaaS services, and Microsoft PSTN services) occurs through Microsoft peering. This peering enables bi-directional connectivity between your WAN and Microsoft public cloud services without using the Internet.

#### Required Subnet Configuration

- Two subnets outside of any VNet address space
- One subnet for primary link, one for secondary link
- Customer uses first usable IP, Microsoft uses second usable IP
- Subnet size options:
  - IPv4: Two /30 subnets
  - IPv6: Two /126 subnets
  - Dual-stack: Two /30 and two /126 subnets
- Public addressing or RFC1918 can be used for [Private peering](#peering-type-azure-private-peering)
- Public addressing must be used for [Microsoft peering](#peering-type-microsoft-peering)

#### VLAN Configuration

- Valid VLAN ID required
- Must be unique within the [ExpressRoute Circuit](#expressroute-circuit)
- Same VLAN ID used for both primary and secondary [ExpressRoute Link](#expressroute-link)

#### BGP Configuration for Private Azure Peerings

- AS number (2-byte or 4-byte supported)
- Private AS numbers allowed except 65515-65520
- Optional MD5 hash for session security

#### BGP Configuration for Microsoft Peerings

- AS number (2-byte or 4-byte supported)
- Private AS numbers allowed except 65515-65520
- Public AS numbers allowed with proof of ownership
- Optional MD5 hash for session security

### ExpressRoute Connection

A Connection is the resource that links an [ExpressRoute Circuit](#expressroute-circuit) at the MSEE to an [ExpressRoute Gateway](#expressroute-gateway). You can have more than one connection on a single [ExpressRoute Circuit](#expressroute-circuit), A standard Azure ExpressRoute circuit can typically support up to 10 connections to virtual networks, all within the same geopolitical region; however this limit is the default and can be raised.

### ExpressRoute Gateway

An ExpressRoute Gateway is a virtual network gateway that enables private connectivity between your on-premises network and Azure through [ExpressRoute Connections](#expressroute-connection).

Key points:

- Acts as a bridge between your virtual network and on-premises network
- Handles routing between these networks
- Supports multiple circuits for redundancy
- Must be deployed in a dedicated gateway subnet
- Scales based on selected SKU
- An [ExpressRoute Gateway](#expressroute-gateway) can connect to more than one [ExpressRoute Connection](#expressroute-connection).

#### Available Gateway SKUs and capabilities

| Gateway SKU  | FastPath | Max Connections |
|------------|----------|-----------------|
| Standard SKU/ERGw1Az  | No | 4 |
| High Perf SKU/ERGw2Az  | No | 8 |
| Ultra Performance SKU/ErGw3Az  | Yes | 16 |
| ErGwScale (Preview)  | Yes* | 4-16** |

> *FastPath requires minimum 10 scale units
> **4 connections per scale unit: 1 unit=4, 2 units=8, 10 units=16

### ExpressRoute Metro

```mermaid

flowchart TD
    subgraph PL2[Peering Location 2]
        CR2[Customer Router 2]
        MSEE_B[MSEE B]
        CR2 <---> MSEE_B
    end
    subgraph PL1[Peering Location 1]
        CR1[Customer Router 1]
        MSEE_A[MSEE A]
        CR1 <---> MSEE_A
    end

    style PL1 fill:#f5f5f5,stroke:#333,stroke-width:2px
    style PL2 fill:#f5f5f5,stroke:#333,stroke-width:2px
    style CR1 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style CR2 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style MSEE_A fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style MSEE_B fill:#e1f5fe,stroke:#0288d1,stroke-width:2px

```
