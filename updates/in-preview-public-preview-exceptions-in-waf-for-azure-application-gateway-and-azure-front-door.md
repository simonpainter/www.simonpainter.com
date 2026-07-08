---
title: "Public Preview: WAF Exceptions for Application Gateway and Front Door"
authors: simonpainter
tags:
  - azure
  - firewall
  - security
date: 2026-07-08
---

Azure WAF has long had exclusion lists — a way to tell the firewall to skip inspecting a specific part of a request, like a header or a cookie. Exceptions are different. They let you skip entire rules, rule groups, or managed rulesets for specific requests, based on attributes like the request URI, the caller's IP address, or a specific header value.

Both Azure Application Gateway and Azure Front Door now support this in public preview.

Think of it this way: an exclusion says "ignore this cookie when running all rules", but an exception says "don't run the SQL injection rule group at all when the request comes from 10.0.0.1". That's a meaningful difference in how precisely you can tune the WAF without weakening protection broadly.

<!-- truncate -->

## What it is

The exceptions feature gives you a new level of control over which WAF rules apply to which requests. You can scope an exception to:

- A single rule
- A rule group (for example, all SQL injection rules)
- An entire managed ruleset

For each exception, you define one or more request attributes that must match before the exception applies. Supported match variables are:

- **Request URI** — match by path
- **Remote IP address** — match by source IP or CIDR
- **Request header name and value** — match a specific header

Match operators include equals, starts with, ends with, contains, and IP match for IP-based exceptions.

One important constraint: exceptions only work with the next-generation WAF engine. On Application Gateway, that means your managed ruleset must be CRS 3.2 or DRS 2.1 (or later). If you're running an older ruleset, you'll need to upgrade first.

## Who should care

If you run WAF in front of web applications and regularly battle false positives, this is for you. The classic scenario is an authentication flow that trips a WAF rule. Maybe your identity provider puts unusual characters in a token header, or your app sends a body payload that looks suspicious to the SQL injection rules. Before exceptions, your options were to disable the rule entirely, add a broad exclusion, or write a custom allow rule — none of which feel great.

Exceptions let you say "only skip that rule when the request is to `/auth/callback`", which is a much safer approach than disabling the rule for everything.

Security teams who need to justify WAF configuration in an audit will also appreciate this. It's far easier to defend "we have an exception scoped to a specific URI and rule" than "we disabled rule 942200 globally".

## How to use it

### Via the Azure portal

1. Open your WAF policy.
2. Under **Settings**, select **Managed rules**.
3. On the **Exceptions** tab, select **Add exceptions**.
4. Choose the ruleset, then set the scope (rule group, specific rule, or the whole ruleset).
5. Add a match condition — for example, `RequestURI` equals `/login.php`.
6. Save the exception.

### Via Azure CLI

The CLI support is available through `az network application-gateway waf-policy managed-rule exception add`. Here's an example that skips the SQL injection rule group for requests to `/login.php` and `/logout.php`:

```bash
az network application-gateway waf-policy managed-rule exception add \
    --resource-group myResourceGroup \
    --policy-name myWAFPolicy \
    --match-variable RequestURI \
    --value-operator Equals \
    --values "/login.php" "/logout.php" \
    --rule-sets '[{"rule-set-type": "Microsoft_DefaultRuleSet", "rule-set-version": "2.1", "rule-groups": [{"rule-group-name": "REQUEST-942-APPLICATION-ATTACK-SQLI"}]}]'
```

### Via PowerShell

```powershell
$ruleGroupEntry = New-AzApplicationGatewayFirewallPolicyExclusionManagedRuleGroup `
    -RuleGroupName 'REQUEST-942-APPLICATION-ATTACK-SQLI'

$exclusionManagedRuleSet = New-AzApplicationGatewayFirewallPolicyExclusionManagedRuleSet `
    -RuleSetType 'Microsoft_DefaultRuleSet' `
    -RuleSetVersion '2.1' `
    -RuleGroup $ruleGroupEntry

$exceptionEntry = New-AzApplicationGatewayFirewallPolicyException `
    -MatchVariable 'RequestURI' `
    -ValueMatchOperator 'Equals' `
    -Values 'login.php', 'logout.php' `
    -ExceptionManagedRuleSet $exceptionManagedRuleSet

$wafPolicy = Get-AzApplicationGatewayFirewallPolicy `
    -Name 'myWAFPolicy' `
    -ResourceGroupName 'myResourceGroup'

$wafPolicy.ManagedRules[0].Exceptions.Add($exceptionEntry)
$wafPolicy | Set-AzApplicationGatewayFirewallPolicy
```

## Gotchas and limits

A few limits to keep in mind before you get started.

Each WAF policy supports up to **60 exceptions**. On Application Gateway, that 60-exception cap is shared across all WAF policies associated with the same gateway, so it's not 60 per policy — it's 60 in total per gateway.

Within a single exception, you're limited to one of the following:

- 600 IP addresses, or
- 10 URIs, or
- 10 request headers

You can't mix match variable types within a single exception. If you need to match on both a URI and an IP, create two separate exceptions.

The feature is **preview only** right now. Microsoft's preview supplemental terms apply, so don't rely on it for production workloads without understanding the stability caveats that come with any Azure preview.

Finally, exceptions are distinct from custom allow rules. A custom allow rule with an *Allow* action bypasses the Default Rule Set, the Core Rule Set, and Bot Protection in one shot. Exceptions are more surgical — you choose exactly which rules to bypass while keeping everything else active.

## Quick takeaway

WAF exceptions fill a genuine gap. They sit between "global exclusion for a request attribute" and "disable this rule for everything", giving you a way to handle false positives without weakening your broader WAF posture. If you're already running CRS 3.2 or DRS 2.1, it's worth testing during the preview to see where it can replace the broader exclusions you've accumulated over time.

## Links

- Official announcement: [Public Preview: Exceptions in WAF for Azure Application Gateway and Azure Front Door](https://azure.microsoft.com/updates?id=567218)
- Learn: [Azure Application Gateway WAF exceptions list (preview)](https://learn.microsoft.com/azure/web-application-firewall/ag/application-gateway-exceptions)
- Learn: [WAF exclusion lists in Azure Application Gateway](https://learn.microsoft.com/azure/web-application-firewall/ag/application-gateway-waf-configuration)
- Learn: [WAF exclusion lists in Azure Front Door](https://learn.microsoft.com/azure/web-application-firewall/afds/waf-front-door-exclusion)
- Learn: [Azure Web Application Firewall overview](https://learn.microsoft.com/azure/web-application-firewall/overview)
