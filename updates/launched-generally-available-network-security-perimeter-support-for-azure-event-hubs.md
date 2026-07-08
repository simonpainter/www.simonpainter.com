---
title: "Generally Available: Network Security Perimeter support for Azure Event Hubs"
authors: simonpainter
tags:
  - azure
  - private-link
  - security
date: 2026-07-08
---

Microsoft has made Network Security Perimeter (NSP) support for Azure Event Hubs generally available. If you've been waiting to use this in production, the wait is over.

NSP lets you draw a logical security boundary around your PaaS resources. Instead of managing individual service firewalls for every resource, you define access rules at the perimeter level and let Azure handle the rest. Event Hubs now joins the growing list of services that support it.

This matters because Event Hubs is often the front door for high-volume data pipelines — telemetry, logs, Kafka topics, IoT streams. Securing that front door without a tangle of per-namespace firewall rules is a real improvement.

<!-- truncate -->

## What it is

Network Security Perimeter is a network isolation feature that creates a logical boundary around Azure PaaS resources. Think of it like a garden wall — everything inside can talk to each other freely, and anything coming from outside needs to knock on the right gate.

For Event Hubs specifically, NSP controls both inbound access (who can send events to your namespace) and outbound access (where your namespace can send data, like to an Azure Storage account for Capture). You manage those rules through NSP profiles, which you can apply to multiple resources at once.

NSP runs as a service under Azure Private Link. It's not a replacement for Private Endpoints, but it sits at a higher level of abstraction — you configure the perimeter once and associate resources to it.

For the full announcement, see [Generally Available: Network Security Perimeter support for Azure Event Hubs](https://azure.microsoft.com/updates?id=567203). The Microsoft Learn documentation is at [Network Security Perimeter - Azure Event Hubs](https://learn.microsoft.com/en-us/azure/event-hubs/network-security-perimeter).

## Who should care

If you run Event Hubs namespaces in environments with strict network controls — regulated industries, financial services, healthcare — this is directly relevant. NSP gives you a clear, auditable boundary that's easier to review than a collection of IP allowlists spread across individual namespaces.

It's also useful if you build data pipelines where Event Hubs talks to other Azure services like Azure Storage for Capture or Azure Key Vault for customer-managed encryption keys (BYOK). NSP secures those PaaS-to-PaaS connections without routing traffic through a virtual network.

Platform and security teams that manage shared Event Hubs infrastructure will get the most immediate benefit from centralised rule management.

## How to use it

You associate an Event Hubs namespace with an NSP using the Azure portal, Azure CLI, or Bicep/ARM. Here's the basic CLI flow:

```bash
# Create a Network Security Perimeter
az network perimeter create \
  --name my-nsp \
  --resource-group my-rg \
  --location uksouth

# Create a profile within the perimeter
az network perimeter profile create \
  --perimeter-name my-nsp \
  --resource-group my-rg \
  --name my-profile

# Associate your Event Hubs namespace with the perimeter
az network perimeter association create \
  --perimeter-name my-nsp \
  --resource-group my-rg \
  --name my-eventhubs-association \
  --private-link-resource '{"id": "<event-hubs-namespace-resource-id>"}' \
  --profile '{"id": "<profile-resource-id>"}'
```

Once associated, the namespace is protected by the perimeter. You then add inbound and outbound access rules to the profile to control which external traffic is allowed through.

For a Bicep example, the association resource type is `Microsoft.Network/networkSecurityPerimeters/resourceAssociations`. The [Microsoft Learn docs](https://learn.microsoft.com/en-us/azure/event-hubs/network-security-perimeter) include full guidance on setting up access rules for common scenarios like Kafka workloads and Capture.

## Gotchas and limits

A few things to keep in mind before you dive in.

NSP doesn't support Geo-disaster recovery for Event Hubs. If your namespace is part of an Event Hubs Geo-DR pairing, you can't use NSP with it yet.

SAS authentication has limited support with NSP. Features like same-perimeter access, cross-perimeter access, and subscription-based access rules don't work with Shared Access Signature tokens. You need Microsoft Entra ID authentication to get full NSP functionality, so check your auth model before you start.

Also, NSP is a perimeter-level control, not a replacement for Private Endpoints if you need private connectivity from within a virtual network. The two can coexist, but they solve different problems.

## Quick takeaway

NSP for Event Hubs is now production-ready. It gives you a cleaner way to define and enforce network boundaries around your event streaming namespaces, especially when those namespaces need to talk to other Azure services securely.

If you're already familiar with NSP from other Azure services, onboarding Event Hubs follows the same pattern. If NSP is new to you, it's worth understanding the model — it's becoming the standard approach for PaaS network isolation in Azure.
