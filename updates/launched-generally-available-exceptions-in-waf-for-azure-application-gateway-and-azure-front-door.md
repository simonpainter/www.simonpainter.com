---
title: "Generally Available: WAF exceptions for Application Gateway and Front Door"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - firewall
date: 2026-10-08
---

WAF exceptions for Azure Application Gateway and Azure Front Door are now generally available. They let you bypass selected managed rules for requests that match specific conditions, rather than turning off a rule for everyone.

That gives teams a more precise way to deal with false positives while keeping the rest of their WAF protections in place.
<!-- truncate -->

## What it is

An exception tells a WAF policy to skip a selected rule, rule group, or managed ruleset when a request matches conditions such as its URI, source IP address, or a request header. For example, you could bypass a troublesome rule for `/auth/callback` while leaving it active for every other request.

Exceptions differ from exclusions. An exclusion tells the WAF not to inspect a particular part of a request, such as a cookie or header, across the rules that would otherwise inspect it. An exception skips selected rules for matching requests.

The feature is now supported in production on both Azure Application Gateway and Azure Front Door. See Microsoft's [GA announcement](https://azure.microsoft.com/updates?id=574343) for the launch details.

## Who should care

This is useful if your WAF blocks valid traffic because a request triggers a managed rule. Authentication callbacks and API requests are common cases, but check your WAF logs first so you know which rule and request attribute are involved.

It's also useful for security teams who need to explain why a rule is bypassed. A condition limited to one endpoint is easier to review than disabling a rule across every request.

## How to use it

In the Azure portal, open the WAF policy and go to **Settings** > **Managed rules** > **Exceptions**. Choose the ruleset and the scope - a rule, rule group, or whole ruleset - then set the request attribute and match condition. Keep the match as narrow as the application allows.

For example, this Azure CLI command adds an Application Gateway exception matching two URIs against the Microsoft Default Ruleset version 2.1:

```bash
az network application-gateway waf-policy managed-rule exception add \
    --resource-group myResourceGroup \
    --policy-name myWAFPolicy \
    --match-variable RequestURI \
    --value-operator Equals \
    --values "login.php" "logout.php" \
    --rule-sets '[0].rule-set-type=Microsoft_Default_Ruleset' \
                '[0].rule-set-version=2.1'
```

For Front Door, configure the exception on the WAF policy associated with the endpoint. Microsoft's guides cover [Application Gateway WAF exceptions](https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/application-gateway-exceptions) and [creating a Front Door WAF policy in the portal](https://learn.microsoft.com/en-us/azure/web-application-firewall/afds/waf-front-door-create-portal).

## Gotchas and limits

Exceptions bypass inspection only for the rules you select and requests that match your condition. They aren't a general request allowlist. A custom WAF rule with an *Allow* action can bypass managed rule evaluation more broadly, so don't use it as a substitute for a narrowly scoped exception.

Application Gateway exceptions require the next-generation WAF engine and CRS 3.2 or DRS 2.1 (or later). Microsoft's [Application Gateway exceptions guide](https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/application-gateway-exceptions) lists the current limits: up to 60 exceptions per WAF policy and 60 across policies associated with a gateway. One exception can match up to 600 IP addresses, 10 URIs, or 10 request headers; those match types can't be combined in a single exception.

Review the WAF logs after deployment to confirm that the exception matches only the intended requests. Keep the rule active for all other traffic.

## Quick takeaway

WAF exceptions are now generally available for Application Gateway and Front Door. Use them to handle known false positives without disabling more protection than the affected requests need.
