---
title: "Public Preview: Azure Route Server dual-stack IPv4/IPv6 support"
authors: simonpainter
tags:
  - azure
  - ipv6
  - bgp
date: 2026-11-10
---

Azure Route Server can now exchange both IPv4 and IPv6 routes in the same deployment. The public preview lets you add IPv6 routing to a hub without replacing its existing IPv4 connections.

That gives teams a way to introduce IPv6 across ExpressRoute, VPN Gateway and network virtual appliance connections while keeping current IPv4 route exchange in place. There are a few prerequisites, and enabling the mode is irreversible, so check the limits before changing an existing route server.
<!-- truncate -->

## What it is

Azure Route Server uses BGP (Border Gateway Protocol) to exchange routes between virtual network appliances and Azure gateways. Dual-stack mode adds IPv6 route exchange alongside IPv4, including for connections to network virtual appliances, ExpressRoute gateways and VPN gateways. Existing IPv4-only connections remain unchanged.

To enable the feature, the virtual network must support IPv4 and IPv6, and **RouteServerSubnet** needs an available IPv6 `/64` prefix. The route server itself must be in a supported preview region.

## Who should care

This is useful if you're adding IPv6 to an Azure hub-and-spoke network or connecting Azure to an IPv6-capable on-premises network. You can start exchanging IPv6 routes through Route Server without rebuilding the IPv4 routing you already rely on.

It's also relevant if an NVA or gateway uses Route Server route maps. The preview supports applying route maps to ExpressRoute and VPN Gateway connections, as well as NVA connections in hub or spoke virtual networks.

## How to enable it

The documented setup uses the Azure portal and updates an existing IPv4-only route server:

1. Check that the route server is in a supported region and that its virtual network has an IPv6 address space.
2. In the virtual network, open **Settings > Subnets**, select **RouteServerSubnet**, add an available IPv6 `/64` from the virtual network's address space, and save.
3. If this is a hub-and-spoke network, resynchronise the spoke peerings after adding IPv6 to the hub.
4. Open the route server, go to **Settings > Configuration**, set **Dual Stack Mode** to **Enabled**, and save after reviewing the confirmation.
5. Wait for provisioning to finish, then check that **Provisioning state** and **Connectivity status** show **Succeeded**. Check expected routes for each address family on connected peers and gateways.

## Gotchas and limits

Dual-stack mode is in public preview and is currently available only in these regions: East US 2 EUAP, Central US EUAP, West Central US, East Asia, UK South, Central US, Australia Central, Korea Central, Central India, Brazil South and Malaysia West.

Enabling the mode is permanent. To return to IPv4-only mode, you must delete and recreate the route server. The portal says enabling it can take up to 40 minutes.

Adding IPv6 address space to a hub and an IPv6 prefix to **RouteServerSubnet** can leave spoke virtual network peerings out of sync. Resynchronise each peering before relying on the updated configuration. Also, seeing routes doesn't prove that packets can reach their destination, so test data-plane connectivity separately.

## Quick takeaway

This preview provides a straightforward path to dual-stack route exchange while preserving existing IPv4 connections. First check regional availability and the hub subnet, then plan the change as a one-way operation and verify both routes and end-to-end traffic.

## Links

- Official announcement: [Public Preview: Azure Route Server dual-stack IPv4/IPv6 support](https://azure.microsoft.com/updates?id=579746)
- Learn: [Enable IPv4/IPv6 dual-stack mode on Azure Route Server](https://learn.microsoft.com/azure/route-server/enable-route-server-dual-stack)
- Learn: [Azure Route Server overview](https://learn.microsoft.com/azure/route-server/overview)
- Preview terms: [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/)
