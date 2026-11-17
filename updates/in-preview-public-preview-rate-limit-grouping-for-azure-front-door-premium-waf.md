---
title: "Public Preview: Rate limit grouping for Azure Front Door Premium WAF"
authors: simonpainter
tags:
  - azure
  - networks
  - firewall
  - security
date: 2026-11-17
---

Azure Front Door Premium WAF rate limit rules can now count matching requests by more than client IP address. In public preview, you can group requests by country or region, autonomous system number (ASN), JA4 client fingerprint, or count every matching request together.

That gives you another way to slow distributed traffic that spreads across many IP addresses. It also means choosing a threshold needs care: a shared group can include legitimate users as well as unwanted traffic.
<!-- truncate -->

## What it is

Rate limiting counts requests that match a WAF custom rule over a fixed one- or five-minute window. Until now, the count was kept separately for each client socket IP address. The new group-by setting lets a rule count requests by a different shared attribute:

| Grouping | How the requests are counted |
| --- | --- |
| Country/region (`GeoLocation`) | Clients from the same country or region share a count. |
| ASN (`Asn`) | Clients on the same network share a count. |
| JA4 fingerprint (`Ja4`) | Clients with the same TLS fingerprint share a count, even across different IP addresses. |
| None (`None`) | All requests matching the rule share a count. |

You can set one grouping per rule. Rules without a group-by setting continue to count by client IP, so existing rate limits don't change.

## Who should care

This is useful if a per-IP limit isn't enough. A botnet can send a modest number of requests from each of many IP addresses; grouping by JA4 can catch clients using the same TLS fingerprint. Grouping by ASN or country can help when a flood comes from a particular network or region.

The `None` option suits a narrow resource such as a sign-in path, where you want to cap the total matching request rate rather than give each client its own allowance.

## How to use it

In the Azure portal, edit a rate limit custom rule in your Front Door Premium WAF policy and select a value under **Group rate limit traffic by**. Keep the match conditions narrow enough to target the traffic you want to control.

For ARM templates, Bicep, and the REST API, set the custom rule's `groupBy` property. This JSON custom-rule fragment groups requests to `/api/search` by JA4 and logs matches while you check normal traffic:

```json
{
  "name": "RateLimitSearchByJa4",
  "priority": 10,
  "enabledState": "Enabled",
  "ruleType": "RateLimitRule",
  "rateLimitDurationInMinutes": 5,
  "rateLimitThreshold": 500,
  "groupBy": [
    {
      "variableName": "Ja4"
    }
  ],
  "matchConditions": [
    {
      "matchVariable": "RequestUri",
      "operator": "Contains",
      "matchValue": [
        "/api/search"
      ]
    }
  ],
  "action": "Log"
}
```

The threshold here is an example, not a recommended value. Measure normal traffic at each edge location, then choose a threshold and enforcement action that suit your application. Azure PowerShell also supports the grouping through `New-AzFrontDoorWafCustomRuleGroupByVariableObject`.

## Gotchas and limits

These groupings are preview features and require Azure Front Door Premium. Each edge location keeps its own counters; requests aren't counted in one global total. A threshold of 500 therefore applies separately at each edge location, and the combined amount allowed across several locations can be higher.

When a group exceeds its threshold, matching traffic for that group is blocked for the rest of the fixed window if the rule uses a blocking action. Other users in the same country, ASN, or JA4 group can be affected too. Start with **Log**, review the results, and consider a JavaScript challenge rather than blocking users outright. For a `None` grouping, every request matching the rule shares the same limit.

## Quick takeaway

Grouping makes Front Door Premium WAF rate limits more useful against distributed traffic, but it changes who shares a threshold. Keep the rule focused, size it from observed traffic at individual edge locations, and test it before enforcing it.

## Links

- Official announcement: [Public Preview: Rate limit grouping for Azure Front Door Premium WAF](https://azure.microsoft.com/updates?id=580155)
- Learn: [WAF rate limiting for Azure Front Door](https://learn.microsoft.com/azure/web-application-firewall/afds/waf-front-door-rate-limit)
- Learn: [Configure a WAF rate-limit rule for Azure Front Door](https://learn.microsoft.com/azure/web-application-firewall/afds/waf-front-door-rate-limit-configure)
- Learn: [Client fingerprint matching for Azure Front Door](https://learn.microsoft.com/azure/web-application-firewall/afds/client-fingerprint-match-condition)
