---
title: "Generally Available: IPv6 support for Azure VPN Gateway"
authors: simonpainter
tags:
  - ipv6
  - azure
  - networks
date: 2026-07-21
---

Azure VPN Gateway IPv6 support is now generally available. You can run dual-stack VPN designs and carry IPv6 traffic between on-prem and Azure without staying in preview.

For teams moving to IPv6, this is a useful step. It means you can keep one platform pattern for remote connectivity instead of building awkward side paths for IPv6 workloads.

I also like that this lines up with existing VPN Gateway workflows. If you already know how to build site-to-site or point-to-site with Azure VPN Gateway, the IPv6 setup feels familiar.
<!-- truncate -->

## What it is

This update makes IPv6 support in Azure VPN Gateway generally available. The main model is dual stack: IPv4 and IPv6 live together, while IPv6 traffic traverses the VPN tunnel as inner traffic.

The official announcement is here: [Generally Available: IPv6 support for Azure VPN Gateway](https://azure.microsoft.com/updates?id=567847).

## Who should care

If you run hybrid networking, this matters. It is most useful for platform teams that need to extend IPv6 subnets between on-premises sites and Azure VNets without replacing their VPN pattern.

It also helps teams that support remote users over point-to-site VPN and need IPv6 reachability for modern app estates.

## How to use it

Start with a dual-stack VNet and GatewaySubnet, then deploy or update a route-based VPN Gateway using a supported SKU. After that, configure your local network gateway prefixes to include both IPv4 and IPv6 ranges, then build your VPN connections as normal.

A quick Azure CLI verification pattern from Microsoft docs looks like this:

```bash
az network vpn-connection show \
  --name "$ConnectionName1" \
  --resource-group "$ResourceGroup" \
  --query "{ProvisioningState:provisioningState, ConnectionStatus:connectionStatus}"
```

If the output returns `Succeeded` and `Connected`, your tunnel is up and healthy.

For step-by-step setup, use these guides:

- [Configure IPv6 for VPN Gateway by using the Azure portal](https://learn.microsoft.com/azure/vpn-gateway/ipv6-configuration)
- [Create a site-to-site IPv6 VPN connection in dual stack using Azure CLI](https://learn.microsoft.com/azure/vpn-gateway/site-to-site-ipv6-azure-cli)
- [VPN Gateway FAQ](https://learn.microsoft.com/azure/vpn-gateway/vpn-gateway-vpn-faq)

## Gotchas and limits

There are a few edges to keep in mind. Microsoft documents dual-stack support on VpnGw1AZ through VpnGw5AZ SKUs, and a gateway deployed in dual stack cannot be moved back to IPv4-only mode.

Protocol support also matters. Point-to-site IPv6 support works with IKEv2 and OpenVPN, but not SSTP. For site-to-site, IPv6 traffic support is tied to IKEv2, while IKEv1 does not support IPv6 in this scenario.

Finally, remember that this is IPv6 support for inner traffic. IPv6 for the outer VPN tunnel is still not available today.

## Quick takeaway

This is a practical Azure networking milestone. IPv6 support for Azure VPN Gateway is now GA, so you can plan dual-stack VPN connectivity with less delivery risk.

If IPv6 rollout has been waiting on stable VPN support, this is a good time to move from pilots into production.
