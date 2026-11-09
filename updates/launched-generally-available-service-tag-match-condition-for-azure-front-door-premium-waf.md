---
title: "Generally available: Service tag matching for Azure Front Door Premium WAF"
authors: simonpainter
tags:
  - azure
  - networks
  - firewall
  - security
date: 2026-11-09
---

Azure Front Door Premium WAF can now match requests against Azure service tags in custom rules, and the feature is generally available. Instead of maintaining a list of IP ranges, you can target a named Azure service while Microsoft maintains its addresses.

That makes it easier to control traffic from Azure services such as monitoring systems. A service tag identifies a service's address ranges, though, not a particular tenant or workload.
<!-- truncate -->

## What it is

A service tag is a named group of IP address prefixes for an Azure service. In an Azure Front Door Premium WAF custom rule, set the match variable to `SocketAddr` or `RemoteAddr`, the operator to `ServiceTagMatch`, and the match value to one or more service tag names.

Microsoft updates the prefixes behind each tag as service addresses change. Your rule can keep using the tag without you editing a CIDR list each time. This is especially useful at Front Door: the origin sees Front Door's address, so an origin network security group can't use the original client address to identify the Azure service that connected.

## Who should care

This is useful if an application behind Front Door needs to allow or block traffic from an Azure service, or apply a rate limit to it. For example, a team could match a monitoring service at the edge instead of copying its address ranges into a custom WAF rule.

It also helps when your origin isn't in Azure and can't use a network security group. The WAF evaluates the address as the request reaches Front Door, before it forwards traffic to the origin.

## How to use it

In the Azure portal, open the WAF policy for your Front Door Premium profile and add a custom rule. Add a `ServiceTagMatch` condition, choose `SocketAddr` or `RemoteAddr`, then select the service tag from the available values. You can combine that condition with a path or other request condition to keep the rule focused.

For example, this rule allows Azure Monitor traffic to a health-check path:

```json
{
  "name": "AllowAzureMonitorHealthCheck",
  "priority": 10,
  "ruleType": "MatchRule",
  "matchConditions": [
    {
      "matchVariable": "RequestUri",
      "operator": "Equals",
      "negateCondition": false,
      "matchValue": ["/health"]
    },
    {
      "matchVariable": "SocketAddr",
      "operator": "ServiceTagMatch",
      "negateCondition": false,
      "matchValue": ["AzureMonitor"]
    }
  ],
  "action": "Allow"
}
```

The conditions are combined, so the rule only allows requests that match both the path and the service tag. An `Allow` action stops further WAF rule evaluation for those requests, so use it only when that is what you intend.

## Gotchas and limits

Choose the match variable with care. `SocketAddr` checks the address that connected to Front Door, which is usually the right choice for matching the Azure service sending the request. `RemoteAddr` uses the client address from `X-Forwarded-For`; callers can supply that header, so it is easier to spoof.

A service tag is not an identity check. It covers the addresses used by that Azure service across customers, so allowing a tag may permit traffic from other tenants using the same service. Prefer a specific tag over a broad one such as `AzureCloud`, and combine it with a path or other condition to reduce the rule's reach.

Tag names must match exactly; wildcards and partial names aren't supported. Multiple tags in one condition match if the address belongs to any of them. The feature applies to Azure Front Door **Premium**.

For a new rule, start with a `Log` action or run the WAF policy in Detection mode. Review the WAF logs before switching to `Block` or `Allow`.

## Quick takeaway

Service tag matching replaces hand-maintained IP ranges with a service name in Front Door Premium WAF custom rules. It's useful for controlling traffic from Azure services, but a tag covers a service's shared address ranges - not a trusted tenant. Keep the condition narrow and check its effect in the logs before enforcing it.

## Links

- Official announcement: [Generally available: Service tag match condition for Azure Front Door Premium WAF](https://azure.microsoft.com/updates?id=577156)
- Learn: [Service tag match condition for Azure Front Door](https://learn.microsoft.com/azure/web-application-firewall/afds/service-tag-match-condition)
- Learn: [Azure service tags overview](https://learn.microsoft.com/azure/virtual-network/service-tags-overview)
