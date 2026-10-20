---
title: "Public Preview: Azure Databricks Private Network Gateway"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - terraform
date: 2026-10-16
---

Azure Databricks has put its private network gateway into public preview. It gives serverless compute a managed route into resources in your virtual network, and networks connected to it, without setting up a separate private endpoint for every resource.

You can also send serverless traffic through your own firewall or out through your own identifiable IP addresses. That gives network and security teams more control over where workloads connect and how downstream systems recognise them.
<!-- truncate -->

## What it is

A private network gateway is a managed connection from Azure Databricks serverless compute into a delegated subnet in your virtual network. From there, traffic can reach resources in that network and connected networks, including on-premises systems reached over ExpressRoute or VPN.

You can route selected DNS destinations through the gateway, or send all eligible outbound traffic through it. The gateway works with an existing network connectivity configuration (NCC), so you attach that NCC to workspaces to make the gateway available to their serverless workloads.

This complements, rather than replaces, Private Link. Private Link remains the direct route to a specific supported Azure service; the gateway is for broader access to your own network and connected destinations.

## Who should care

This is useful if serverless Databricks workloads need to reach private services, databases, or on-premises systems. It also suits teams that need outbound traffic inspected by their own firewall, or downstream systems that only allow known source IP addresses.

If your only requirement is private access to one supported Azure service, a Private Link endpoint rule may still be the better fit. The gateway is most useful when you need a path into your network, rather than a private endpoint for each destination.

## How to use it

The portal setup is at the Databricks account level:

1. In the account console, open **Previews** and enable access to the private network gateway preview.
2. Open **Security > Network connectivity configurations** and select an NCC in the target region, or create one.
3. Open its **Private network gateway** tab and choose **Add private network gateway**.
4. Select a dedicated subnet in your Azure virtual network. Delegate it to `Microsoft.Databricks/workspaces` first.
5. Choose a bandwidth tier and traffic mode. Use `SPECIFIC_DESTINATIONS` to route named DNS destinations, or `ALL_TRAFFIC` to route eligible egress through the gateway.
6. Create the gateway, then attach the NCC to the workspaces that should use it.

For example, a workspace that needs to reach `orders.internal.contoso.com` could use `SPECIFIC_DESTINATIONS` and route that DNS name through the gateway, leaving unrelated traffic on its existing path. The configuration guide also has an API request example and Terraform resource guidance if you manage account networking as code.

## Gotchas and limits

This preview requires an Azure Databricks **Premium** account and account-admin access, plus a workspace with serverless compute enabled. The gateway needs a dedicated subnet of `/28` or larger, delegated to `Microsoft.Databricks/workspaces`, in the same region as the NCC and workspace.

Choose destinations with the routing rules in mind. Private Link routes take precedence over the gateway. Azure service endpoint traffic also doesn't switch to the gateway, and the gateway can't reach cloud services through those endpoints. With `ALL_TRAFFIC`, add the intended destinations to your serverless egress network policy as well.

Preview regions and bandwidth tiers are limited; the current documentation lists supported regions and tiers of 10, 30, 50, or 100 Gbps. The Premium plan is required, and billing for the gateway begins on or after **1 December 2026**. Check the current requirements before designing around it, as preview capabilities can change.

## Quick takeaway

The private network gateway gives Databricks serverless compute a managed route into your Azure network, with options for destination-specific routing or broader egress control. It fills a gap that Private Link alone doesn't cover, but it still depends on sound subnet, routing, DNS, and egress-policy design.

## Links

- Official announcement: [Public Preview: Azure Databricks Private network gateway](https://azure.microsoft.com/updates?id=576556)
- Learn: [Private network gateway overview](https://learn.microsoft.com/azure/databricks/security/network/serverless-network-security/private-network-gateway)
- Learn: [Configure a private network gateway](https://learn.microsoft.com/azure/databricks/security/network/serverless-network-security/private-network-gateway/configure-private-network-gateway)
- Learn: [Serverless egress control](https://learn.microsoft.com/azure/databricks/security/network/serverless-network-security/network-policies)
