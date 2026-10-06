---
title: "Public Preview: IPv6 support for Application Gateway WAF"
authors: simonpainter
tags:
  - ipv6
  - firewall
  - azure
  - networks
  - security
date: 2026-10-05
---

Azure Application Gateway WAF can now inspect IPv6 client traffic in public preview. That closes a gap for dual-stack sites: IPv6 requests can reach an application through the gateway without leaving the web application firewall out of the path.

You still need a dual-stack Application Gateway v2, and your backend must remain IPv4. Here's what the preview adds, and where its limits matter.
<!-- truncate -->

## What it is

Application Gateway already supports IPv6 on its frontend in a dual-stack setup. This preview adds WAF support for that IPv6 traffic, so managed rule sets can inspect requests over both IPv4 and IPv6.

It isn't an IPv6-only design. The gateway needs IPv4 and IPv6 configuration, and backend pools still use IPv4 addresses.

## Who should care

This is for teams moving public applications to dual stack who use Application Gateway WAF as their security boundary. It lets IPv6 clients use the same gateway instead of needing a separate route that doesn't pass through WAF.

It's also relevant if you need to apply geo-based WAF custom rules to IPv6 clients. That part has a separate preview feature registration step, covered below.

## How to use it

Create an Application Gateway v2 in a dual-stack virtual network and select **Dual stack (IPv4 & IPv6)** for its IP address type. Configure its IPv4 and IPv6 frontends, then attach a WAF_v2 policy as you would for an IPv4 gateway.

If you want geo-based custom rules to evaluate IPv6 traffic, register the preview feature in your subscription:

```bash
az feature register \
    --name AllowAppGwWafIpv6Geo \
    --namespace Microsoft.Network

az feature registration show \
    --name AllowAppGwWafIpv6Geo \
    --provider-namespace Microsoft.Network \
    --output table
```

Check that registration has completed before relying on those rules. You don't need this registration for managed rule sets, non-geo custom rules, or IPv6 logging and diagnostics.

## Gotchas and limits

- **Dual stack and v2 only.** IPv6-only gateways aren't supported. Use the Standard_v2 or WAF_v2 SKU.
- **Existing IPv4-only gateways can't be converted.** Plan to create a new dual-stack gateway and move traffic to it.
- **Backends remain IPv4.** IPv6 backend addresses and IPv6 Private Link aren't supported.
- **Some custom rules have limits.** IP address-based custom rule conditions don't support IPv6 traffic. IPv6 geo-based custom rules are in preview, need the feature registration above, and require dual-stack public and private IP configurations.
- **Other integration limits apply.** Application Gateway Ingress Controller (AGIC) doesn't support IPv6 configuration.
- **The WAF feature is in preview.** Review Microsoft's preview terms before using it for production workloads.

## Quick takeaway

This preview lets a dual-stack Application Gateway WAF protect IPv6 frontend traffic, which removes one more reason to route IPv6 around your existing security controls. Check the custom-rule limits first, and plan for a new gateway if you're starting from IPv4-only.

## Links

- Official announcement: [Public Preview: IPv6 Support for Application Gateway WAF](https://azure.microsoft.com/updates?id=573861)
- Learn: [Configure Application Gateway with a frontend public IPv6 address](https://learn.microsoft.com/azure/application-gateway/ipv6-application-gateway-portal)
- Learn: [IPv6 geo-based custom rules for Application Gateway WAF (preview)](https://learn.microsoft.com/azure/web-application-firewall/ag/custom-rules-geo-based-ipv6)
- Preview terms: [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/)
