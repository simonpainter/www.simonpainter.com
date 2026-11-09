---
title: "Generally Available: WAF Insights for Azure Application Gateway"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - firewall
  - monitoring
  - troubleshooting
date: 2026-11-09
---

WAF Insights for Azure Application Gateway is now generally available. It brings Web Application Firewall logs and metrics into interactive dashboards in the WAF policy, so you can investigate blocked requests and false positives without writing queries.

The GA release adds support for Azure Diagnostics and resource-specific logs, and renames the Triage tab to Investigate. Each request is counted once according to its final WAF outcome, making the dashboard totals easier to interpret.
<!-- truncate -->

## What it is

WAF Insights provides two views of your Application Gateway WAF activity. **Monitor** shows overall activity and the most active rules. **Investigate** lets you drill down from a rule or URL to the affected request and every rule it matched.

The dashboard combines metrics for at-a-glance trends with logs for request-level detail. That gives operations and security teams a shared place to spot changes in WAF activity, check policy behaviour and investigate individual requests.

## Who should care

If you manage an Application Gateway WAF policy, this gives you a faster way to understand what it is blocking and why. It’s useful when a legitimate request is blocked, when a rule suddenly becomes noisy, or when you need to review a potential attack.

Application and security teams can use the same request-level view to tell a false positive from an unwanted request, then decide whether a policy change is appropriate.

## How to use it

In the Azure portal, open the WAF policy associated with your Application Gateway and select **Insights**. Use **Monitor** to check activity and active rules, then switch to **Investigate** to follow a rule or URL through to matching requests.

For example, if users report blocked sign-ins, start in Monitor and look for a rise in WAF activity. In Investigate, choose the sign-in URL and inspect the requests and rules involved. You can then compare a specific request with your application logs before changing the policy.

WAF Insights needs diagnostic settings configured for the Application Gateway associations you want to monitor. Send WAF logs to a Log Analytics workspace and enable the metrics you want to track. The GA release supports both Azure Diagnostics and resource-specific log formats.

## Gotchas and limits

Metrics are useful for spotting trends, while logs provide request-level detail and can take longer to appear. Log retention and query performance depend on your Log Analytics workspace configuration, so set retention to match your investigation and audit needs.

There’s a documentation wrinkle: the [Microsoft Learn WAF Insights page](https://learn.microsoft.com/azure/web-application-firewall/ag/insights) still describes the second tab as **Triage** and says resource-specific tables aren't supported. The GA announcement confirms the tab is now **Investigate** and both log formats are supported, so follow the announcement for those GA-specific changes.

## Quick takeaway

WAF Insights gives Application Gateway teams a built-in route from WAF trends to the request and rules behind them. Enable diagnostic settings, use Monitor to spot changes, and use Investigate to understand them before tuning your policy.

## Links

- Official announcement: [Generally Available: WAF Insights for Azure Application Gateway](https://azure.microsoft.com/updates?id=579280)
- Learn: [Azure Application Gateway WAF Insights](https://learn.microsoft.com/azure/web-application-firewall/ag/insights)
- Learn: [Monitor logs for Azure Web Application Firewall](https://learn.microsoft.com/azure/web-application-firewall/ag/web-application-firewall-logs)
- Learn: [Diagnostic logs for Azure Application Gateway](https://learn.microsoft.com/azure/application-gateway/application-gateway-diagnostics)
