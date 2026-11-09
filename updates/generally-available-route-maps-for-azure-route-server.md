---
title: "Generally Available: Route Maps for Azure Route Server"
authors: simonpainter
tags:
  - azure
  - bgp
  - routing-protocols
date: 2026-11-09
---

Route Maps for Azure Route Server are now generally available in the Azure public cloud. They let you filter, summarise, and change BGP routes as they pass through Route Server, rather than accepting every route as advertised.

The feature is useful for hybrid networks that need tighter control over route propagation or path selection. GA also brings support for applying route maps to virtual network connections for peered spokes, alongside BGP peers and ExpressRoute or VPN gateway connections.

<!-- truncate -->

## What it is

Azure Route Server exchanges BGP routes between network virtual appliances (NVAs), gateways, and virtual networks. A route map adds an ordered set of rules to that exchange. Each rule matches routes by prefix, AS path, or BGP community, then permits, modifies, aggregates, or drops them.

You can apply one route map in each direction on a connection. An inbound map processes routes received by Route Server; an outbound map processes routes it advertises. Route maps change routing information, not data packets.

## Who should care

Route Maps are relevant if you use Azure Route Server to connect an NVA, ExpressRoute, or VPN to a hybrid network. They can help filter unwanted prefixes, reduce route counts through summarisation, or influence which of several paths BGP prefers.

The spoke support is useful when Route Server is in a hub VNet and an NVA is in a peered spoke. You can associate a map with the spoke's virtual network connection to control routes exchanged with that spoke.

## How to use it

Create and apply route maps in the Azure portal. Azure PowerShell can create a route map and apply it to a BGP peering; use the portal for gateway and virtual network connections. PowerShell examples require Az.Network 8.2.0 or later.

This example creates an inbound rule that prepends ASN 64511 to routes beneath `10.2.0.0/16`, then applies the map to a BGP peer. A longer AS path can make those routes less preferred than an alternative path. Replace the sample resource names and prefix with values from your network.

```powershell
$criterion = New-AzRouteMapRuleCriterion `
    -MatchCondition "Contains" `
    -RoutePrefix @("10.2.0.0/16")

$actionParam = New-AzRouteMapRuleActionParameter -AsPath @("64511")
$action = New-AzRouteMapRuleAction -Type "Add" -Parameter @($actionParam)
$rule = New-AzRouteMapRule `
    -Name "prepend-route" `
    -MatchCriteria @($criterion) `
    -RouteMapRuleAction @($action) `
    -NextStepIfMatched "Terminate"

New-AzRouteMap `
    -ResourceGroupName "myResourceGroup" `
    -VirtualHubName "myRouteServer" `
    -Name "inbound-prepend" `
    -RouteMapRule @($rule)

$routeMap = Get-AzRouteMap `
    -ResourceGroupName "myResourceGroup" `
    -VirtualHubName "myRouteServer" `
    -Name "inbound-prepend"
$peer = Get-AzRouteServerPeer `
    -ResourceGroupName "myResourceGroup" `
    -RouteServerName "myRouteServer" `
    -PeerName "myBgpPeer"

$routingConfig = $peer.RoutingConfiguration
$routingConfig.InboundRouteMap = New-Object `
    Microsoft.Azure.Commands.Network.Models.PSResourceId `
    -Property @{ Id = $routeMap.Id }

Update-AzRouteServerPeer `
    -ResourceGroupName "myResourceGroup" `
    -RouteServerName "myRouteServer" `
    -PeerName $peer.Name `
    -PeerIp $peer.PeerIp `
    -PeerAsn $peer.PeerAsn `
    -RoutingConfiguration $routingConfig
```

`Update-AzRouteServerPeer` replaces the peering's routing configuration. The example starts with the existing configuration so it preserves other settings. Check the effective routes and the Route Maps connections dashboard after applying a policy.

For a spoke NVA, create the Route Server virtual network connection after creating the route map. This connection doesn't replace VNet peering or BGP peering; it gives Route Server a place to associate the map with routes exchanged with the spoke.

## Gotchas and limits

The first route map created on a Route Server triggers a one-time upgrade that can take up to 30 minutes. Route maps also incur additional charges.

Rules run in order. A rule with no match conditions matches every route on that connection, and routes that match no rule are allowed by default. Check the match and rule order carefully before applying a map.

Route summarisation removes the AS path and BGP communities from the resulting summary. Route maps support only 2-byte ASNs, and Azure reserves several ASNs and BGP communities; check the [route map limitations](https://learn.microsoft.com/en-us/azure/route-server/route-maps-about#considerations-and-limitations) before changing attributes. You can't use route maps on the Microsoft Enterprise Edge (MSEE), and outbound maps don't affect Route Server's best-path selection.

## Quick takeaway

GA makes Route Maps ready for production use in the Azure public cloud, with support for peered spoke connections as well as BGP peers and gateway connections. Start by recording the routes you expect, apply a narrowly scoped map, then verify the result before relying on it.

## Links

- Official announcement: [Generally Available: Route maps for Azure Route Server](https://azure.microsoft.com/updates?id=578966)
- Learn: [About route maps for Azure Route Server](https://learn.microsoft.com/en-us/azure/route-server/route-maps-about)
- Learn: [Configure route maps for Azure Route Server](https://learn.microsoft.com/en-us/azure/route-server/route-maps-how-to)
- Previous post: [Public Preview: Route Maps for Azure Route Server](/updates/in-preview-public-preview-route-maps-for-azure-route-server)
- Pricing: [Azure Route Server pricing](https://azure.microsoft.com/pricing/details/route-server/)
