---
title: "Generally Available: Azure Front Door profile and route-level WAF policies"
authors: simonpainter
tags:
  - azure
  - firewall
  - networks
date: 2026-11-09
---

Azure Front Door now supports Web Application Firewall (WAF) policies at both profile and route scope in general availability. I can set a shared policy for a whole profile, then give a specific route its own policy when it needs different protection.

That helps when one Front Door profile serves several applications or APIs with different risk profiles. I can keep a sensible default across the profile without forcing every route to use exactly the same WAF rules.
<!-- truncate -->

## What it is

A WAF policy contains the rules that inspect requests reaching an application. With profile-level association, one policy covers the profile; route-level association lets a policy target selected routes instead.

If more than one scope matches a request, Azure uses the most specific policy: route, then domain, then profile. The feature is now generally available, so it can be used for production workloads.

## Who should care

This is useful if one Azure Front Door profile serves several sites, applications or API paths that need different controls. A profile policy can cover shared protection, while a route policy can be tuned for a sensitive endpoint or a path that needs different rules.

It also gives teams a way to manage policies around application boundaries without splitting traffic across separate Front Door profiles.

## How to use it

For example, a profile might serve `www.example.com/*` and `www.example.com/admin/*`. I could associate a baseline policy with the profile, then create a separate policy for the admin route.

In the Azure portal:

1. Create a WAF policy for Azure Front Door and associate it with the profile using **Profile** scope.
2. Create another policy for the admin path.
3. On its **Association** tab, choose the same Front Door profile, set **Association scope** to **Route**, then select the domain and admin route.
4. Save the policy, review its rules and mode, then test the route before relying on it to block traffic.

The [Azure portal tutorial](https://learn.microsoft.com/azure/web-application-firewall/afds/waf-front-door-create-portal) walks through creating and associating a policy.

## Gotchas and limits

Policies at different scopes don't stack. If a route-level policy matches, it takes precedence over the domain- and profile-level policies. Don't assume the route policy inherits the profile policy's rules; make sure the effective policy contains the protection that route needs.

Detection mode logs matching requests without blocking them. Prevention mode takes the configured action, so review the logs and tune rules before switching a policy to prevention. Managed rule sets also have tier limits: Microsoft documents them for Azure Front Door Premium and Classic, not Standard.

## Quick takeaway

Profile and route scopes make it easier to apply different WAF policies behind one Front Door profile. Use the profile policy for shared protection, and add route policies where the rules need to differ - then check which policy actually applies to each request.

## Links

- Official announcement: [Generally Available: Azure Front Door profile and route level WAF policies](https://azure.microsoft.com/updates?id=578153)
- Learn: [Azure Web Application Firewall on Azure Front Door](https://learn.microsoft.com/azure/web-application-firewall/afds/afds-overview)
- Learn: [Policy settings for Web Application Firewall in Azure Front Door](https://learn.microsoft.com/azure/web-application-firewall/afds/waf-front-door-policy-settings)
- Learn: [Create a WAF policy for Azure Front Door in the Azure portal](https://learn.microsoft.com/azure/web-application-firewall/afds/waf-front-door-create-portal)
