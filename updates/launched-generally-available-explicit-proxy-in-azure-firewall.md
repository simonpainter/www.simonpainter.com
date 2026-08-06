---
title: "Generally Available: Explicit Proxy in Azure Firewall"
authors: simonpainter
tags:
  - firewall
  - azure
  - zero-trust
date: 2026-08-06
---

Azure Firewall's explicit proxy mode has moved from preview to general availability. It's a different way to handle outbound traffic, and for some network designs it's a much cleaner fit than the traditional transparent proxy approach.

In the default transparent proxy mode, you force traffic through the firewall using user-defined routes (UDRs). With explicit proxy, you point the application or browser directly at the firewall's private IP address. No UDR required. The application knows it's talking to a proxy, and the firewall handles the rest.

This matters if you've ever struggled to route traffic from environments where adding UDRs is awkward, or where you want application-aware proxy control without the routing complexity.

<!-- truncate -->

## What it is

Azure Firewall normally intercepts traffic transparently. Your VMs send packets to their destination, UDRs redirect those packets to the firewall, and the firewall processes them without the source application knowing. It works well, but it ties you to a specific routing topology.

Explicit proxy flips that model. You configure the application — a browser, a script, a container — to use the firewall's private IP on port 8080 (HTTP) or 8443 (HTTPS) as its proxy endpoint. Traffic goes straight from the application to the firewall, bypassing the need for UDRs entirely. Think of it like giving your application the address of a post office rather than intercepting every envelope en route.

You configure explicit proxy in the firewall policy, not on the firewall resource itself. That's an important distinction if you manage multiple firewalls through a shared policy.

```mermaid
graph LR
    A[Application / Browser] -->|Proxy: 10.0.0.4:8080| B[Azure Firewall]
    B -->|Outbound| C[Internet / Destination]
```

## Who should care

If you run workloads that can't easily be controlled via UDRs — think containers, developer machines joined to an Azure VNet, or Azure Arc-managed servers reaching back to Azure — explicit proxy gives you a simpler path.

It's also useful for teams that want proxy-aware application control. Because the application explicitly connects to the proxy, you get cleaner logs and can enforce proxy settings through group policy, environment variables, or PAC files.

Zero-trust designs benefit here too. Explicit proxy lets you enforce consistent egress policy without relying entirely on network-layer routing tricks.

## How to use it

You need an Azure Firewall with an associated firewall policy. Enable explicit proxy in the policy settings. The firewall listens on port 8080 for HTTP and 8443 for HTTPS.

Here's a minimal Bicep snippet to enable explicit proxy in a firewall policy:

```bicep
resource firewallPolicy 'Microsoft.Network/firewallPolicies@2024-01-01' = {
  name: 'my-fw-policy'
  location: resourceGroup().location
  properties: {
    explicitProxy: {
      enableExplicitProxy: true
      httpPort: 8080
      httpsPort: 8443
      enablePacFile: false
    }
  }
}
```

If you want to use a PAC (Proxy Auto-Configuration) file — a small JavaScript file that tells browsers which proxy to use for which destinations — the firewall can host it for you. You'll need an Azure Storage account and a user-assigned managed identity with the Storage Blob Data Contributor and Storage Blob Data Reader roles on that account.

For Azure CLI, you can update an existing policy like this:

```bash
az network firewall policy update \
  --name my-fw-policy \
  --resource-group my-rg \
  --explicit-proxy enable=true http-port=8080 https-port=8443
```

## Gotchas and limits

Explicit proxy only covers HTTP and HTTPS traffic. If you have other protocols to control, you still need transparent proxy mode (and UDRs) for those flows. The two modes aren't mutually exclusive — you can run both — but you need to be deliberate about which traffic goes where.

PAC file hosting requires a managed identity with the right storage roles. If you're in an environment with strict RBAC, getting that approved can take time, so plan ahead.

Also, any application that doesn't support proxy configuration won't benefit from explicit proxy mode. That includes a lot of background system traffic and some Azure services that communicate directly rather than through configurable proxy settings.

Azure Policy definitions are available to enforce consistent explicit proxy configuration across your firewall policies. Worth using if you're rolling this out at scale.

## Quick takeaway

Explicit proxy mode is now GA in Azure Firewall. It's a cleaner alternative to UDR-based routing for HTTP and HTTPS traffic, and it opens up control for workloads that are hard to route transparently.

If you manage developer environments, Arc-connected servers, or any workload where proxy-aware config is easier than routing manipulation, this is worth a look.

Official docs: [Azure Firewall explicit proxy](https://learn.microsoft.com/azure/firewall/explicit-proxy)  
Azure update announcement: [Generally Available: Explicit proxy in Azure Firewall](https://azure.microsoft.com/updates?id=568825)
