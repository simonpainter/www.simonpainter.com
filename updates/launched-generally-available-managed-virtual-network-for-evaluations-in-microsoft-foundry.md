---
title: "Generally Available: Managed virtual network for evaluations in Microsoft Foundry"
authors: simonpainter
tags:
  - azure
  - ai
  - networks
  - security
  - cloud
  - automation
date: 2026-06-03
---

Microsoft has made managed virtual network support for evaluations in Microsoft Foundry generally available. You can now keep evaluation workloads inside a Microsoft-managed private network boundary without having to build and run your own virtual network just to get started.

If you work in a regulated environment, or you simply want tighter control of outbound traffic, this is a useful step. It gives you a cleaner path to private connectivity for evaluation runs, while still letting you use Foundry's hosted evaluation features.

The nice part is that Microsoft handles most of the plumbing. You still choose the isolation mode and approve access to the services you need, but you don't have to manage the underlying network estate yourself.
<!-- truncate -->

## What it is

Managed virtual network creates a Microsoft-managed network boundary around the Foundry account. For evaluations, that means outbound traffic can stay inside a controlled path instead of falling back to broad internet access.

The service can use managed private endpoints to reach dependencies such as Azure Storage, Azure Cosmos DB, and Azure AI Search. Those private endpoints are managed by Microsoft, so you won't see customer-visible NICs appear in your own subscription.

Microsoft announced the launch here: [Generally Available: Managed virtual network for evaluations in Microsoft Foundry](https://azure.microsoft.com/updates?id=564402). The main setup guide is here: [Configure managed virtual network for Microsoft Foundry projects](https://learn.microsoft.com/azure/foundry/how-to/managed-virtual-network).

## Who should care

This matters most if you're running evaluation jobs against models or agents that touch private data, internal services, or tightly controlled storage accounts. It is also useful if your security team already expects private endpoints and approved egress paths for cloud services.

I think this will land well with platform teams who want Foundry evaluations but don't want the overhead of designing a full bring-your-own virtual network for every project. It is a bit like renting a secure room instead of building a new office block just to hold one meeting.

## How to use it

At a high level, you create the Foundry account with managed network injection enabled, assign the Foundry managed identity the right approval role, then choose the outbound mode for the managed network.

For teams that want the tightest egress control, `allow_only_approved_outbound` is the interesting option. In that mode, Foundry creates required outbound rules for core dependencies, including private endpoints for Storage, Cosmos DB, and AI Search, plus service tags for Azure Active Directory and Azure Machine Learning for the evaluations catalogue.

Here's a simple Azure CLI example based on the Microsoft docs:

```azurecli
az rest --method PUT \
  --url "https://management.azure.com/subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.CognitiveServices/accounts/{account-name}?api-version=2026-03-01" \
  --body '{
    "location": "{region}",
    "kind": "AIServices",
    "sku": { "name": "S0" },
    "identity": { "type": "SystemAssigned" },
    "properties": {
      "allowProjectManagement": true,
      "customSubDomainName": "{account-name}",
      "networkInjections": [
        {
          "scenario": "agent",
          "subnetArmId": "",
          "useMicrosoftManagedNetwork": true
        }
      ]
    }
  }'

az cognitiveservices account managed-network create \
  --resource-group {resource-group} \
  --name {account-name} \
  --managed-network allow_only_approved_outbound \
  --firewall-sku Standard
```

After that, run your evaluations in the usual way with the Foundry SDK. The cloud evaluation guide is here if you want the Python workflow: [Run evaluations in the cloud by using the Microsoft Foundry SDK](https://learn.microsoft.com/azure/foundry/how-to/develop/cloud-evaluation).

If you prefer infrastructure as code, Microsoft has sample templates for both [Bicep](https://github.com/microsoft-foundry/foundry-samples/tree/main/infrastructure/infrastructure-setup-bicep/18-managed-virtual-network) and [Terraform](https://github.com/microsoft-foundry/foundry-samples/tree/main/infrastructure/infrastructure-setup-terraform/18-managed-virtual-network).

## Gotchas and limits

There are a few catches worth knowing up front. The network injection settings must be present when you create the Foundry account. You can't bolt them on later.

The isolation modes are also not fully interchangeable. Once you configure `allow_internet_outbound`, you can't switch that resource back to disabled. If you configure `allow_only_approved_outbound`, you can't later change it to `allow_internet_outbound`.

If you add FQDN outbound rules, Foundry creates a managed Azure Firewall and you pay for it. Those FQDN rules only support ports 80 and 443. You also can't bring your own firewall to the managed network model.

One more practical point: if you send evaluation or trace data to Application Insights, you may need outbound FQDN rules for `settings.sdk.monitor.azure.com`, `*.livediagnostics.monitor.azure.com`, and `*.in.applicationinsights.azure.com`.

## Quick takeaway

This is a solid update for anyone who wants to evaluate AI workloads in Foundry without leaving networking as an afterthought. You get a safer default, less network setup to own, and a clearer path to using evaluations in environments that care about private connectivity and controlled egress.

If I were already using Foundry evaluations and had been holding back because of network concerns, I would take another look now.
