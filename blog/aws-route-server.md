---
title: AWS Route Server vs Azure Route Server
authors: simonpainter
tags:
  - aws
  - azure
  - bgp

date: 2025-06-01

---

I have found that Azure networking has been designed to be familiar to network engineers, even though a lot of the logical constructs are based on smoke and mirrors they largely behave like the things we're used to; a great example being the VNet that doesn't exist or the load balancer that is also a figment of our imagination. AWS Networking on the other hands seems to have been created by a bunch of developers high on peyote who thought they knew better than everyone else. This is why it took me a few years to pass the AWS Advanced Networking exam but only a few days to pass the Azure Networking Engineering Associate exam.

This philosophical difference becomes crystal clear when comparing Azure Route Server and AWS Route Server - two services with confusingly similar names that solve different problems and are reflective of their respective platforms' fundamental approaches to networking.

## The Azure Approach: BGP as a Service

Azure Route Server is essentially "BGP as a Service" - a managed service that enables dynamic routing between Network Virtual Appliances (NVAs) and your Azure virtual network through standard BGP peering. It behaves like real networking equipment that network engineers understand, supporting transitive routing and acting as a bridge between your virtual network and connected gateways.

> Azure Route Server does sometimes feel like the awkward cousin of Azure Virtual WAN. Now
> I am not saying it happened like this but I can imagine a bunch of Azure devs sat in a
> Seattle coffee shop on their 15th espresso getting very excited that the box they just
> designed for powering [vwan](vwan-hype.md) could be a standalone product and enable them
> to ship two things for the price of one. I would love it if some of the [recent enhancements](https://learn.microsoft.com/en-us/azure/virtual-wan/route-maps-about)
> to vwan made it to Azure Route Server.

The service requires a dedicated /27 subnet (suggesting it's actually a scale set of VMs under the hood - classic Azure smoke and mirrors), but once deployed, it enables sophisticated routing scenarios that mirror traditional campus networking designs.

### Azure Route Server Use Cases

**SD-WAN Integration**: Azure Route Server excels at integrating SD-WAN appliances into Azure networking. The NVA can peer with Route Server via BGP, advertising on-premises routes learned through the SD-WAN overlay. Route Server then propagates these routes to ExpressRoute or VPN gateways, enabling seamless connectivity between cloud workloads and branch offices. This transitive routing capability means traffic flows naturally through the SD-WAN appliance without manual route table manipulation.

**Scale-Out Load Balancer Architectures**: Perhaps the most compelling use case is exemplified by [HAProxy Enterprise's Route Health Injection](https://www.haproxy.com/documentation/haproxy-enterprise/enterprise-modules/route-health-injection/) (RHI) feature. Multiple HAProxy instances can advertise the same Virtual IP addresses via BGP, leveraging Equal Cost Multi-Path (ECMP) routing to distribute traffic across multiple load balancer instances. When a HAProxy node fails health checks for its backend servers, it withdraws its BGP advertisement, automatically removing itself from the load balancing pool. This enables true horizontal scaling of stateless network functions.

**Roll your own VWAN**: In hub-and-spoke topologies, Azure Route Server can coordinate routing with NVAs to build something that looks like VWAN but is less of a black box.

**Anycast Services**: Azure Route Server can support [anycast architectures](anycast-route-server.md) where multiple instances advertise the same service IP from different locations.

## The AWS Approach: Specialised Failover Orchestration

AWS Route Server takes a different approach. Rather than providing general-purpose BGP peering, it's a highly specialisfed tool designed for one specific scenario: orchestrating failover between active/passive network appliances within a single VPC. Crucially, it must be associated with specific route tables and provides no transitive routing capabilities - embodying AWS's philosophy of explicit, non-transitive networking.

### AWS Route Server Use Cases

**Active/Passive Firewall Clusters**: The primary use case is coordinating failover between paired NVAs. When the primary NVA fails, AWS Route Server automatically updates the associated route table to redirect traffic to the standby appliance. This works well for stateful firewalls where session state isn't replicated between instances.

**Single-Region NVA Failover**: Any scenario requiring automatic failover between primary and backup network appliances within a VPC benefits from AWS Route Server's approach. The lack of multipath support is actually advantageous when dealing with stateful appliances that can't share session information.

## The Fundamental Difference: Transitive vs Non-Transitive Routing

The core philosophical difference lies in routing transitivity. Azure Route Server supports transitive routing, allowing learned routes to propagate between BGP peers and virtual network gateways. This enables hub-based architectures where Route Server acts as a central routing coordinator, much like a traditional campus network design.

AWS Route Server deliberately avoids transitivity, focusing on manipulating specific route tables in response to appliance failures. This reflects AWS's broader networking philosophy where explicit configuration and non-transitive routing are preferred over the "magic" of traditional networking protocols.

## The Naming Confusion

The similar names mask fundamentally different services. Azure Route Server is a general-purpose BGP peering service that enables sophisticated routing architectures. AWS Route Server is a specialised failover orchestration tool designed for specific appliance redundancy scenarios.

These services perfectly encapsulate their respective platforms' networking philosophies. Azure provides familiar abstractions that behave like traditional networking equipment, even when implemented through software-defined mechanisms. AWS offers purpose-built tools that solve specific problems through explicit configuration and non-transitive routing models.

Understanding these  differences helps avoid the confusion caused by similar naming. More importantly, it ensures you choose the right tool for your specific networking requirements rather than assuming equivalent functionality based on service names.
