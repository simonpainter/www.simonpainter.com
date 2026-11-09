---
title: "Public Preview: Azure Firewall IPv6 now supports application rules"
authors: simonpainter
tags:
  - azure
  - networks
  - ipv6
  - firewall
  - security
date: 2026-11-09
---

Azure Firewall's IPv6 preview now supports application rules as well as network rules. That means you can filter outbound IPv6 web traffic by fully qualified domain name, rather than relying only on IP addresses and ports.

This closes an important gap for dual-stack networks: IPv6 workloads can now use both network-layer controls and application-layer FQDN filtering on Azure Firewall. The feature is still in public preview, and some IPv6 scenarios remain unsupported.

<!-- truncate -->

## What it is

Azure Firewall and Firewall Policy support IPv6 in dual-stack mode. Application rules let you allow or deny traffic to specific fully qualified domain names over supported protocols such as HTTPS. Microsoft now lists IPv6 application rules alongside IPv6 network rules in its [dual-stack deployment guide](https://learn.microsoft.com/azure/firewall/deploy-dual-stack-firewall).

## Who should care

If you run dual-stack workloads and use Azure Firewall to control outbound access, this lets you apply FQDN-based rules to IPv6 traffic too. It's particularly useful when a workload reaches a service by name and its destination IP addresses can change.

If your IPv6 policy only needs to allow traffic to fixed address ranges and ports, network rules may still be enough. Application rules add a more specific option for web traffic.

## How to use it

Create an application rule with an IPv6 source prefix and the destination FQDN. For example, this Azure CLI command creates a collection and allows HTTPS traffic from one IPv6 subnet to `www.example.com`:

```bash
az network firewall application-rule create \
  --resource-group my-rg \
  --firewall-name my-fw \
  --collection-name allow-web \
  --name allow-example \
  --protocols Https=443 \
  --source-addresses fd00:c1d0:3f1f:2::/64 \
  --target-fqdns www.example.com \
  --action Allow \
  --priority 200
```

Replace the example resource names, prefix, and FQDN with values from your environment. The command is part of the `azure-firewall` Azure CLI extension. See the [application rule CLI reference](https://learn.microsoft.com/cli/azure/network/firewall/application-rule) and the [dual-stack setup guide](https://learn.microsoft.com/azure/firewall/deploy-dual-stack-firewall) before changing a firewall.

## Gotchas and limits

This is still a preview, so check the [Azure preview terms](https://azure.microsoft.com/support/legal/preview-supplemental-terms/) before using it.

Azure Firewall supports IPv4-only or dual-stack deployments, not IPv6-only firewalls. DNAT, Classic Azure Firewall, Virtual Hub Firewall, threat intelligence, IDPS, Explicit Proxy, and IP Groups-based scenarios aren't supported for IPv6. You also can't revert a dual-stack firewall to IPv4-only during the preview. These limitations apply to IPv6; compatible existing IPv4 features continue to work in a dual-stack deployment.

## Quick takeaway

IPv6 application rules make Azure Firewall more useful for dual-stack egress: you can filter supported web traffic by FQDN instead of depending only on network rules. It's a meaningful addition, but keep the preview limitations in view and test the exact features your IPv6 traffic depends on.

## Links

- Official announcement: [[In preview] Public Preview: Azure Firewall IPv6 now supports application rules](https://azure.microsoft.com/updates?id=579507)
- Learn: [Deploy Azure Firewall in dual stack mode (preview)](https://learn.microsoft.com/azure/firewall/deploy-dual-stack-firewall)
- Learn: [Azure Firewall application rule CLI reference](https://learn.microsoft.com/cli/azure/network/firewall/application-rule)
- Learn: [Azure Firewall preview features](https://learn.microsoft.com/azure/firewall/firewall-preview)
