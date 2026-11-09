---
title: "Generally Available: HTTP DDoS ruleset for Azure Front Door Premium WAF"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - firewall
date: 2026-11-09
---

Azure Front Door Premium now offers the HTTP DDoS ruleset for its Web Application Firewall (WAF) as a generally available feature. It learns normal request patterns and can respond when a surge looks like a layer 7 attack.

The rules start in Log mode, so you can review matches before enforcing them. The per-country geo rules are still in preview; the per-client and suspected-bot rules are generally available.
<!-- truncate -->

## What it is

The HTTP DDoS ruleset, `Microsoft_HTTPDDoSRuleSet_1.0`, learns traffic thresholds for each Front Door profile and for individual client IP addresses. It first checks whether the profile's overall request rate has crossed its threshold, then applies the narrower per-client thresholds.

Two rules are generally available: **500100** detects an unusually high request rate from a client, and **500110** detects high request rates from clients Microsoft Threat Intelligence classifies as bots. Each rule has three sensitivity levels. Higher sensitivity means a lower threshold.

## Who should care

This is relevant if you use Azure Front Door Premium to serve a public application or API. Static IP filters and fixed rate limits can miss distributed attacks where many clients each send a modest volume of requests. The ruleset learns your profile's traffic patterns instead.

## How to use it

In the Azure portal, open the WAF policy attached to your Front Door Premium profile and go to **Managed rules**. Add **Microsoft HTTP DDoS Ruleset 1.0**, then review the rules and their sensitivity and action settings. Keep the default **Log** action while you check how the rules match your normal traffic.

For example, if a health probe is matching rule 500100, add a WAF exception scoped to that rule and match the probe's source IP, request URI, or header. Avoid exempting more traffic or rules than the probe needs.

Check the **Web Application Firewall Request count** metric, filtered by rule name, to review matches. A custom WAF rule with an **Allow** action does not bypass this ruleset; use a WAF exception for trusted traffic.

## Gotchas and limits

The ruleset applies to Azure Front Door **Premium**. It needs enough recent traffic to learn a useful baseline: a profile must have received traffic on at least half of the previous seven days. Detection can take 24 to 36 hours to begin, and a profile without enough traffic history won't detect or mitigate attacks until it has enough data.

The two geo rules, **500310** and **500320**, are still in preview. They learn thresholds for high-volume countries or regions and for combined traffic from other locations. Treat them as preview functionality, not as part of the generally available rules.

## Quick takeaway

The HTTP DDoS ruleset adds adaptive layer 7 protection to Front Door Premium WAF. Start with Log, review the matches and your baseline, then choose actions and sensitivity that fit your traffic. Keep trusted-traffic exceptions narrow, and remember that geo rules remain in preview.

## Links

- Official announcement: [Generally Available: HTTP DDoS ruleset for Azure Front Door Premium WAF](https://azure.microsoft.com/updates?id=578681)
- Learn: [HTTP DDoS ruleset in Azure Front Door WAF](https://learn.microsoft.com/en-us/azure/web-application-firewall/afds/http-ddos-ruleset)
- Learn: [Exceptions in Azure Front Door WAF](https://learn.microsoft.com/en-us/azure/web-application-firewall/afds/front-door-exceptions)
