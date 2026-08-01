---
title: "Route Maps for Azure Route Server is now generally available"
authors: simonpainter
tags:
  - azure
  - bgp
  - routing-protocols
date: 2026-08-01
---

Route Maps for Azure Route Server has moved from public preview to generally available. If you've been holding off on using it in production, that's the signal you've been waiting for.

I [covered the preview announcement](/updates/in-preview-public-preview-route-maps-for-azure-route-server) when it landed, so this is a good moment to take stock of what the feature actually gives you and why it matters for real hybrid networking deployments.

<!-- truncate -->

## What Route Maps does

Azure Route Server handles BGP route exchange between your NVAs, ExpressRoute and VPN gateways, and the rest of your virtual network. Before Route Maps, you didn't have much influence over what went in or came out of that exchange. You took what your BGP peers gave you and hoped for the best.

Route Maps adds a policy layer on top of that exchange. You define an ordered list of rules, each with match conditions and actions. When a route matches, you can drop it, aggregate it, or modify its BGP attributes before it continues. You apply these in the inbound direction (routes arriving at Route Server) or outbound direction (routes leaving Route Server), one route map per direction per connection.

The three things you can do are:

**Route filtering** — drop specific prefixes so they never propagate. Useful when an NVA is learning routes you don't want in your virtual network routing table.

**BGP attribute modification** — prepend ASNs to influence path selection, or tag routes with BGP communities for easier management downstream.

**Route summarisation** — replace a group of specific prefixes with a single aggregate. Fifty /24s become one /16 at the Route Server boundary.

## Why GA matters

Public preview means the feature exists and works, but Microsoft won't promise SLA-level reliability and the terms are preview terms, not production terms. GA means you can use it confidently in environments where your change management process won't let you touch preview features.

The announcement is at [Generally Available: Route Maps for Azure Route Server](https://azure.microsoft.com/en-us/updates?id=568631).

## The prefix limit connection

If you've read my earlier post on [how Azure Route Server counts the prefix limit](/route-server-prefix-limit/), you'll know there's a sharp edge there. The limit is 1,000 routes per BGP peer, but the count includes both currently learned routes and incoming routes in a BGP update. Advertise 501 routes and then update all 501 of them at once, and Route Server sees that as 1,002 routes and tears down the peering.

Route Maps gives you a practical mitigation for this. If you're running an SD-WAN or any scenario where many prefixes flow through Route Server, outbound summarisation can collapse those individual routes into aggregates before they hit the limit. You're not reducing what's real in your network — you're reducing what Azure propagates.

It's not a silver bullet. Summarisation strips BGP Community and AS-PATH attributes from the resulting aggregate, so if downstream systems rely on those, you'll need to think carefully about where you apply it. But for organisations that have been managing a careful head count of their routes to stay clear of that 1,000 route limit, this is genuinely useful.

## A practical example

Here's a route map that aggregates ten /24s into a /20 on the inbound direction, using PowerShell:

```powershell
# Match the ten individual /24 prefixes
$criterion = New-AzRouteMapRuleCriterion `
    -MatchCondition "Contains" `
    -RoutePrefix @("10.10.0.0/20")

# Replace the matched prefixes with the aggregate
$actionParam = New-AzRouteMapRuleActionParameter `
    -RoutePrefix @("10.10.0.0/20")
$action = New-AzRouteMapRuleAction `
    -Type "Replace" `
    -Parameter @($actionParam)

# Build the rule
$rule = New-AzRouteMapRule `
    -Name "summarise-site-prefixes" `
    -MatchCriteria @($criterion) `
    -RouteMapRuleAction @($action) `
    -NextStepIfMatched "Terminate"

# Apply the route map to your Route Server
New-AzRouteMap `
    -ResourceGroupName "myResourceGroup" `
    -VirtualHubName "myRouteServer" `
    -Name "inbound-summary" `
    -RouteMapRule @($rule) `
    -InboundConnection @("<bgp-peering-connection-resource-id>")
```

## Things to watch out for

The first time you create a route map on a Route Server, the service runs a one-time upgrade that takes around 30 minutes. It's disruptive if you're not expecting it — schedule it in a maintenance window.

A few other limits that carry over from preview:

- 2-byte ASNs only (up to 65535). 4-byte ASNs aren't supported in route map actions.
- Don't use reserved ASNs for prepending: 8074, 8075, 12076, or the private range 65515–65520.
- Don't remove BGP communities in the 65517:\* and 65518:\* ranges — those are Azure-internal.
- Route Maps adds extra cost on top of standard Route Server pricing. Check the [Azure Route Server pricing page](https://azure.microsoft.com/pricing/details/route-server/) before rolling it out at scale.

## Quick takeaway

Route Maps fills a real gap in Azure Route Server. GA status means you can now put it in front of production traffic without apologising to your change advisory board.

If you're managing hybrid connectivity with prefixes pushing towards that 1,000 route limit, or if you've wanted more control over what your Route Server learns and advertises, this is worth experimenting with. Start on a non-production Route Server so the one-time upgrade doesn't catch you off guard.
