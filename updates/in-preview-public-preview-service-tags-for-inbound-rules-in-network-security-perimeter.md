---
title: "[In preview] Public Preview: Service tags for inbound rules in network security perimeter"
authors: simonpainter
tags:
  - azure
  - networks
  - private-link
  - security
date: 2026-11-19
---

Network Security Perimeter (NSP) is adding service-tag support for inbound rules when connecting to supported third-party services. Instead of copying a service's IP prefixes into a CIDR rule and updating them yourself, you can select its tag and have Microsoft maintain the address list.

That gives teams a simpler way to allow traffic from a supported service to perimeter-associated PaaS resources. A service tag isn't a tenant identity check, though: it can cover multiple service instances, so it may grant broader access than a single workload.
<!-- truncate -->

## What it is

Azure Network Security Perimeter (NSP) groups supported platform-as-a-service resources behind a logical network boundary. Inbound access rules on a profile control which traffic can reach those resources. With this preview, a rule can use an Azure service tag as its source instead of a list of IP prefixes.

A service tag is a named group of IP address prefixes for an Azure service. Microsoft maintains the prefixes as service addresses change, so the rule doesn't need manual updates each time the list changes.

## Who should care

This is useful if a third-party service you rely on can reach a Key Vault, Azure Monitor, Azure AI Search, Event Hubs, or Service Bus resource associated with your NSP. A tag can replace a hand-maintained IP list and makes the rule easier to understand.

It suits teams that already manage PaaS access through NSP profiles and want to allow a supported third-party service without tracking its changing address ranges. If you need to trust one specific tenant or workload, a service tag alone doesn't provide that level of identity.

## How to use it

Create an inbound rule in the Azure portal:

1. Open **Network security perimeters**, then select the perimeter and profile.
2. Select **Inbound access rules** and choose **Add**.
3. Set **Source type** to **Service Tag**, then choose the tag you need.
4. Set the rule name, action and profile, then save it.

For example, if a partner service's tag is available, create an **Allow** rule named `Allow-PartnerService`, select **Service Tag** as the source type, choose the tag shown for that service, and apply the rule to the profile containing your Key Vault. The example name is illustrative; the Azure Updates announcement doesn't name specific third-party tags. Test the connection and review the NSP access logs to confirm the rule allows the expected traffic.

## Gotchas and limits

Service tag inbound rules currently support Key Vault, Azure Monitor, Azure AI Search, Event Hubs and Service Bus resources associated with a perimeter. Azure Storage isn't supported for this use; Microsoft warns that some scenarios might appear to work while others fail or behave inconsistently. Don't use service tag rules to control inbound access to Storage.

Not every service tag is available for NSP inbound rules. The Learn walkthrough says the portal lists supported tags, but the Azure Updates announcement doesn't identify which third-party tags are included in this preview. Check that the tag you need is available before planning around it. Use the narrowest suitable tag, preferably a regional one where available.

Tags represent address ranges, not a particular customer or workload. A tag can include traffic from multiple Microsoft-owned service instances and may include multitenant workloads or third-party code. Use one only if that broader service-level trust fits your security requirements.

Test the rule in Transition mode before switching to Enforced mode, and review access logs after deployment. Existing CIDR rules remain available; service tags complement them rather than replacing them.

## Quick takeaway

Service tags reduce the work of maintaining IP-based inbound rules for supported NSP resources. They don't identify a tenant, and Storage isn't supported, so check the supported resource and tag lists before relying on one.

## Links

- Official announcement: [[In preview] Public Preview: Service tags for inbound rules in network security perimeter](https://azure.microsoft.com/updates?id=579201)
- Learn: [Configure service tag access in Azure Network Security Perimeter](https://learn.microsoft.com/en-us/azure/private-link/configure-network-security-perimeter-service-tag)
- Learn: [Network security perimeter concepts](https://learn.microsoft.com/en-us/azure/private-link/network-security-perimeter-concepts)
