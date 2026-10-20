---
title: "Generally Available: Azure DNS Traffic Manager linked records"
authors: simonpainter
tags:
  - azure
  - dns
  - load-balancing
  - networks
date: 2026-10-20
---

Azure DNS Traffic Manager Linked Records are now generally available. They link a DNS record set directly to a Traffic Manager profile, so Azure DNS can return the selected endpoint without exposing a `trafficmanager.net` name in the response.

That makes Traffic Manager easier to use at your domain apex, supports DNSSEC-signed zones, and adds stricter checks that record and endpoint types match. The existing alias-record approach remains available, but linked records are the recommended option when you connect Azure DNS to Traffic Manager.
<!-- truncate -->

## What it is

Traffic Manager directs clients to endpoints through DNS answers. A linked record connects an Azure DNS record set to a Traffic Manager profile; Azure DNS resolves the profile internally and returns endpoint IP addresses for A or AAAA records, or endpoint names for CNAME records.

This differs from a traditional CNAME to `myprofile.trafficmanager.net`, which returns the Traffic Manager name and requires the resolver to look it up separately. Linked records use DNS flattening, keeping that intermediate name out of the response. They also work with DNSSEC-signed zones and use Strictly Typed Profiles to validate that the profile's endpoints match the record type.

## Who should care

If you want your root domain, such as `example.com`, to use Traffic Manager, linked A or AAAA records avoid the CNAME-at-the-apex restriction. They're also useful if your DNS zone is signed with DNSSEC, or if you want Azure to catch endpoint and record-type mismatches before they cause resolution problems.

Teams already using Traffic Manager for subdomains can use linked records to manage the DNS-to-profile connection directly in Azure DNS. The profile still handles routing and health checks; it doesn't sit in the application's data path.

## How to use it

First, make sure the **Microsoft.Network** resource provider is registered. If the DNS zone and Traffic Manager profile are in different subscriptions, register it in both:

```bash
az provider register --namespace Microsoft.Network
```

In the Azure portal, open your Azure DNS zone and select **+ Record set**. Choose the record name (leave it blank for the zone apex) and type, then enable **Traffic Management**. Select the subscription and Traffic Manager profile, and save the record. The record inherits its TTL from the profile.

The profile must already exist, and its endpoint types must match the record you create: A records need IPv4 targets, AAAA records need IPv6 targets, and CNAME records need FQDN targets. See Microsoft's [portal tutorial for creating a Traffic Manager Linked Record](https://learn.microsoft.com/en-us/azure/dns/tutorial-traffic-manager-linked-records-portal) for a complete walkthrough.

## Gotchas and limits

The record type determines what endpoints the profile can use. A and AAAA records can be used at the zone apex; CNAME records cannot, because DNS does not allow a CNAME at the apex. A Traffic Manager profile's strict type is fixed once set, so choose the right type when creating or configuring the profile.

Each Traffic Manager profile supports up to 50 linked records. Traffic Manager queries from linked records count towards Traffic Manager billing, and Azure blocks deletion of a profile while linked records still refer to it. Remove those DNS records first.

TTL comes from the Traffic Manager profile, not the DNS record set. Set the profile's TTL with your health checks and expected failover time in mind; DNS resolvers may also cache answers for the advertised TTL.

## Quick takeaway

Linked records are now the recommended way to connect Azure DNS to Traffic Manager. They support apex records, preserve DNSSEC validation, and enforce endpoint type compatibility. If you're creating a new Traffic Manager-backed DNS record, use the dedicated linked-record option in your Azure DNS zone.

## Links

- Official announcement: [Azure DNS enables DNS-based load balancing through Traffic Manager linked records](https://azure.microsoft.com/updates?id=573917)
- Learn: [Traffic Manager Linked Records overview](https://learn.microsoft.com/en-us/azure/dns/dns-traffic-manager-linked-records)
- Learn: [Create a Traffic Manager Linked Record in the Azure portal](https://learn.microsoft.com/en-us/azure/dns/tutorial-traffic-manager-linked-records-portal)
- Learn: [Strictly Typed Profiles for Azure Traffic Manager](https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-strictly-typed-profiles)
- Learn: [What is Traffic Manager?](https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-overview)
