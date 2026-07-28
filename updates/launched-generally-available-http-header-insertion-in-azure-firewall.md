---
title: "Generally Available: HTTP header insertion in Azure Firewall"
authors: simonpainter
tags:
  - firewall
  - azure
  - security
date: 2026-07-28
---

Azure Firewall can now insert custom HTTP headers into outbound web traffic, and this feature is generally available. You configure header insertion directly on an application rule, so the firewall adds the headers as traffic passes through — no proxy, no extra hop.

The headline use case is Microsoft 365 tenant restriction. You can stamp a `Restrict-Access-To-Tenants` header on every outbound HTTP request to Microsoft services, which blocks corporate users from signing into personal or competitor tenants without leaving your network perimeter. That's a meaningful control, and doing it at the firewall means you don't need to deploy a dedicated proxy service just for this.

The feature also covers broader scenarios: passing authentication tokens downstream, tagging traffic for backend apps that expect specific headers, or building lightweight access controls for SaaS apps. It's a small addition to the rule engine that covers a wide range of real-world problems.

<!-- truncate -->

## What it is

HTTP header insertion lets you attach custom key-value HTTP headers to traffic that matches an application rule in Azure Firewall. When a request hits the rule, the firewall injects your headers before the traffic continues to its destination.

The feature is part of Azure Firewall's application rule layer, which already handles FQDN filtering and URL-based allow/deny decisions. Adding header insertion to the same rule keeps everything in one place: the matching condition and the header action live together.

For the official announcement, see [Generally Available: HTTP header insertion in Azure Firewall](https://azure.microsoft.com/updates?id=568115). Microsoft's configuration guide is at [Configure HTTP header insertion in Azure Firewall](https://learn.microsoft.com/en-us/azure/firewall/configure-http-header-insertion).

## Who should care

If you run hub-and-spoke networks where Azure Firewall is your central egress point, this is useful. Platform teams managing shared internet breakout for multiple business units now have a native way to attach per-tenant or per-service headers without routing traffic through a dedicated proxy.

Security teams focused on data exfiltration controls will want to look at the tenant restriction scenario. It's one of the most practical controls you can apply to stop credential misuse across Microsoft 365 services.

It's also relevant if you integrate with backend services or SaaS APIs that rely on specific request headers for routing, access control, or audit logging.

## How to use it

Header insertion lives in the application rule configuration. You define one or more header name-value pairs, and they apply whenever traffic matches that rule. You can set this up in the portal, Azure CLI, or PowerShell.

### Azure CLI example

This example creates an application rule that allows traffic to `*.microsoft.com` and `*.azure.com` while inserting tenant restriction headers:

```bash
az network firewall policy rule-collection-group collection add-filter-collection \
    --policy-name "fw-policy" \
    --resource-group "my-rg" \
    --rcg-name "rcg-web" \
    --name "app-collection-1" \
    --collection-priority 10003 \
    --action Allow \
    --rule-name "allow-microsoft-with-tenant-restriction" \
    --rule-type ApplicationRule \
    --target-fqdns "*.microsoft.com" "*.azure.com" \
    --source-addresses "10.0.0.0/24" \
    --protocols Http=80 Https=443 \
    --http-headers-to-insert \
        "Restrict-Access-To-Tenants=contoso.com,fabrikam.onmicrosoft.com" \
        "Restrict-Access-Context=aaaabbbb-0000-cccc-1111-dddd2222eeee"
```

The `--http-headers-to-insert` flag takes `name=value` pairs. You can stack multiple headers in a single rule — up to the 16 KB combined limit.

For HTTPS traffic, you need the Premium SKU with TLS inspection enabled. Without TLS inspection, the firewall can't read or modify the encrypted request headers.

### Verifying the configuration

Once deployed, confirm your rule is set up as expected:

```bash
az network firewall policy rule-collection-group show \
    --policy-name fw-policy \
    --resource-group my-rg \
    --name rcg-web
```

Look for your rule name in the output and check that the `httpHeadersToInsert` property lists the headers you configured.

## Gotchas and limits

**SKU matters.** Standard and Basic SKUs support HTTP only. Premium SKU supports both HTTP and decrypted HTTPS. If you need to insert headers into HTTPS traffic, you're committing to TLS inspection, which has its own operational overhead around certificate management and private CA distribution.

**Reserved headers are off limits.** You can't insert or overwrite a defined set of reserved headers. These cover connection management (`host`, `content-length`, `connection`), authentication and cookies (`authorization`, `cookie`, `set-cookie`, `proxy-authorization`), security headers (`content-security-policy`, `strict-transport-security`, `x-frame-options`), and forwarding headers (`x-forwarded-for`, `x-forwarded-host`, `forwarded`). The full list is in the [Microsoft docs](https://learn.microsoft.com/en-us/azure/firewall/configure-http-header-insertion).

**Header limits.** The total combined length of all header names and values in a single rule is capped at 16 KB. Individual header names can be up to 100 characters, and values up to 16,000 characters. You'll hit the JSON size limit on a rule collection group before you hit these limits in practice, but if you're building a dense policy, be aware that header insertion reduces your effective rule budget.

**Rule scope.** Headers apply per rule. If you want to insert headers across multiple destination FQDNs or source ranges, you'll need to repeat the configuration in each relevant rule. There's no global header policy that applies to all traffic.

## Quick takeaway

HTTP header insertion in Azure Firewall is a practical, low-friction way to enforce tenant-level access controls and inject custom headers at the network perimeter. The tenant restriction use case alone is worth evaluating if your organisation uses Microsoft 365 and wants to prevent account switching from corporate networks.

If you're on the Premium SKU with TLS inspection already running, HTTPS header insertion is available immediately with no extra configuration. On Standard or Basic, it's HTTP only — which still covers a reasonable set of scenarios.
