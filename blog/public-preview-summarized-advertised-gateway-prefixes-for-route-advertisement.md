---
title: "Public Preview: Summarized advertised gateway prefixes for route advertisement"
authors: simonpainter
tags:
  - azure
  - networks
  - expressroute
  - security
  - bgp
  - cloud
date: 2026-05-25
---

Microsoft has put **summarized advertised gateway prefixes** into public preview for Azure hybrid gateways. In plain terms, you can now tell Azure to advertise a smaller, cleaner set of CIDRs to on-prem instead of every hub and spoke prefix.

This matters when your hub-and-spoke estate gets large and your route table starts to look like a junk drawer. Fewer advertised prefixes can reduce operational noise and help you stay under ExpressRoute advertised prefix limits.

The update applies to Azure VPN Gateway and ExpressRoute Gateway scenarios where route advertisement scale and control are both pain points.

<!-- truncate -->

## What it is

Azure added support for a virtual network property called `summarizedGatewayPrefixes`. You define one or more aggregated CIDR blocks on the gateway VNet, and Azure advertises those summaries to on-prem BGP peers.

By default, Azure advertises the hub address space plus peered spoke address spaces. With summarised prefixes configured, Azure advertises your summary list instead and suppresses covered spoke prefixes.

## Who should care

If you run hybrid networking with hub-and-spoke in Azure, this is for you. It is most useful when:

- you are close to ExpressRoute advertised prefix limits
- you have lots of spokes and want a cleaner on-prem routing view
- you want tighter control over what Azure advertises upstream

## Gotchas and limits

A few points are easy to miss:

- The setting only takes effect on the VNet that has the gateway subnet and gateway.
- The summary CIDR should include the gateway VNet address space.
- Avoid overlaps inside your summary list.
- Spoke VNets covered by the summary are suppressed from advertisement.
- You can set the property before the gateway exists, but it does nothing until the gateway is present.

Also remember the route-scale context: ExpressRoute private peering has limits on how many prefixes Azure can advertise to on-prem. This feature helps reduce that count, but you still need to design your address plan and summaries carefully.

## Quick takeaway

This preview gives you a practical route-summarisation control point for Azure hybrid gateways. If you are battling advertised prefix scale in hub-and-spoke, this is a feature worth testing now.

## Links

- Official announcement: [Public Preview: Summarized advertised gateway prefixes for route advertisement](https://azure.microsoft.com/updates?id=562813)
- Learn: [Advertised gateway prefixes in Azure virtual networks](https://learn.microsoft.com/azure/virtual-network/advertised-gateway-prefixes-overview)
- Learn: [About ExpressRoute virtual network gateways](https://learn.microsoft.com/azure/expressroute/expressroute-about-virtual-network-gateways#gateway-limitations-and-performance)
- Learn: [ExpressRoute FAQ: route advertisement limits and behaviour](https://learn.microsoft.com/azure/expressroute/expressroute-faqs#what-is-expressroute)
- Learn: [VPN Gateway FAQ: BGP and routing](https://learn.microsoft.com/azure/vpn-gateway/vpn-gateway-vpn-faq#bgp-and-routing)
