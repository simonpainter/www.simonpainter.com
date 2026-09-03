---
title: "Public Preview: Azure Front Door profile- and route-level WAF policies"
authors: simonpainter
tags:
  - azure
  - firewall
  - networks
date: 2026-09-03
---

Azure Front Door WAF can now be attached at both the profile and route levels in public preview. That gives me a cleaner way to set a broad baseline policy for everything on a Front Door profile, then tighten or change protection for the routes that need special handling.

This matters because not every path behind the same Front Door has the same risk. A public marketing site, a login path, and an internal API often need different controls, and route-level WAF lets you make that split without cloning whole profiles or piling every rule into one big policy.

<!-- truncate -->

## What it is

This preview adds more flexible policy association for Azure Front Door WAF. You can apply one policy at **profile scope** for shared protection, then apply a different policy at **route scope** for traffic that needs more specific treatment.

Azure uses the most specific scope when more than one policy applies to a request. In plain English, that means **route-level beats domain-level, and domain-level beats profile-level**.

Think of it like the front door lock on a building versus a lock on a server room. The main lock covers everyone, but the tighter lock protects the one space that needs it most.

## Who should care

This is useful if you run several applications or paths behind one Front Door profile and they don't all need the same WAF behaviour. It fits teams that want one shared baseline, but don't want to weaken that baseline just because one route has a noisy false positive or a stricter security need.

It's also handy for staged rollouts. You can keep a profile-level policy in detection mode, then put a sensitive route on its own policy and move that route to prevention mode once you've tuned it.

## How to use it

The simplest pattern is to start with a baseline profile-level policy, then add route-level policies only where the application really needs them.

### A concrete portal example

Say I have one Front Door profile serving both a public site and an admin API:

- `www.example.com/*` should use a shared baseline WAF policy
- `www.example.com/admin/*` should use a stricter policy with tighter custom rules and different blocked-response behaviour

In the Azure portal, I would:

1. Create the baseline WAF policy and associate it with the **Front Door profile**.
2. Create a second WAF policy for the admin path.
3. Open the second policy's **Association** tab.
4. Choose the same Front Door profile, set **Association scope** to **Route**, then select the admin route.
5. Save the policy and test the effective behaviour on that route.

That gives the whole profile a default security posture, while the admin route gets its own policy where needed.

## Gotchas and limits

A few things are worth checking before you change anything live.

If multiple scopes apply, Azure Front Door uses the most specific one. That's helpful, but it also means a route-level policy can override choices you thought were coming from the profile-level baseline. Test the effective policy path by path before you switch anything important into prevention mode.

Front Door **Standard** supports custom WAF rules, but managed rule sets are a **Premium** feature. So the new association model helps both tiers, but Premium gives you the fuller set of WAF controls.

You also need to remember that some WAF settings are policy-level. For example, the blocked response comes from the effective policy for that request. If your route-level policy has a different custom block page or status code, that is what the client will see.

Finally, this is still a preview. Microsoft's preview terms apply, so I'd treat it as something to test and tune first rather than drop straight into a critical production change window.

## Quick takeaway

This preview makes Azure Front Door WAF easier to run in the real world. I can keep one broad policy for the whole profile, then apply sharper controls only to the routes that need them. That's a much neater fit for shared Front Door deployments than forcing every application path into the same security shape.

## Links

- Official announcement: [Public Preview: Azure Front Door profile and route level WAF policies](https://azure.microsoft.com/updates?id=569804)
- Learn: [Azure Web Application Firewall on Azure Front Door](https://learn.microsoft.com/azure/web-application-firewall/afds/afds-overview)
- Learn: [Policy settings for Web Application Firewall in Azure Front Door](https://learn.microsoft.com/azure/web-application-firewall/afds/waf-front-door-policy-settings)
- Learn: [Tutorial: Create a WAF policy on Azure Front Door by using the Azure portal](https://learn.microsoft.com/azure/web-application-firewall/afds/waf-front-door-create-portal)
- Learn: [Configure a Web Application Firewall rate-limit rule on Azure Front Door](https://learn.microsoft.com/azure/web-application-firewall/afds/waf-front-door-rate-limit-configure)
