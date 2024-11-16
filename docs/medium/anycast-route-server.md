
# Beyond DNS: Implementing Anycast in Azure with Route Server and NVAs

What to do about global site load balancing.

### Introduction: The Evolution of Global Load Balancing

Global failover between regional data centres has traditionally been tackled using DNS-based global site load balancer solutions like the trusty F5 GTM. As organisations have migrated to cloud networks, this method has been largely replicated with capabilities like AWS Route 53 and Azure Traffic Manager. These DNS-based solutions offer the ability to direct traffic to the best regional instance of an application.

DNS-based global load balancers solve cross-region failover problems by offering health checks and the ability to perform IP geolocation-based routing to specific instances. The latter gives us the ability to offer regionalisation of an application, which can provide market-targeted versions of a site, language tailoring, and also address data sovereignty concerns.

However, DNS options don’t excel at addressing latency or network path-based closest instance routing. While Route 53 can be used on a private hybrid network to fulfil many of these functions (although geolocation on private hybrid networks is understandably clumsy), Azure Traffic Manager is internet-only. This limitation creates a gap that needs to be addressed, especially for organisations with complex hybrid cloud architectures.

There are several ways to fill this gap, including:

1. Deploy a traditional GTM solution, either on-premises or as a Network Virtual Appliance (NVA), and integrate it into the hybrid cloud.
2. Implement an anycast routing solution.

This article focuses on the second approach: implementing anycast in Azure using Network Virtual Appliances (NVAs) and Azure Route Server. This method provides a robust solution for routing traffic efficiently across multiple regions, particularly for private network scenarios where DNS-based solutions fall short.

### Understanding the Need for Anycast in Azure

Before diving into the implementation details, it’s crucial to understand why anycast is necessary and how it complements Azure’s existing offerings.

**The Gap in Azure’s Global Load Balancing Solutions**

Azure provides several tools for distributing traffic globally, such as Azure Traffic Manager and Azure Front Door. However, these solutions have limitations:

1. Public IP Requirement: They primarily work with public endpoints, making them unsuitable for private network scenarios.
2. DNS-Based Routing: They rely on DNS for routing, which can be slow to propagate changes and doesn’t work well with long-lived connections.
3. Protocol Limitations: Some solutions are optimised for HTTP/HTTPS traffic, leaving gaps for other protocols.

**Enter Anycast: Filling the Void**

Anycast addresses these limitations by offering:

1. Private Network Compatibility: Works seamlessly within private networks, ideal for hybrid cloud scenarios.
2. IP-Based Routing: Utilises network-layer routing for faster failover and better handling of long-lived connections.
3. Protocol Agnostic: Supports any IP-based protocol, not just HTTP/HTTPS.
4. Reduced Latency: Automatically routes traffic to the nearest healthy instance based on network topology, not just geolocation.

### Technical Implementation of Anycast with Azure Route Server

**Key Components**

1. Azure Route Server: Acts as a bridge between NVAs and Azure’s networking infrastructure.
2. Network Virtual Appliance (NVA): Advertise the anycast IP address and handle traffic.
3. ExpressRoute: Enables hybrid connectivity between Azure and on-premises networks.
4. Virtual Network Gateways: Facilitate communication between Azure and on-premises networks.

**Topology Overview**

The implementation typically involves:

1. Hub and spoke topologies in multiple Azure regions.
2. NVA in each region advertising the same IP address (the anycast IP) to Azure Route Server.
3. Azure Route Server propagating these routes to on-premises networks via ExpressRoute or VPN Gateway.
4. On-premises infrastructure resolving the application’s DNS name to the anycast IP.

**Detailed Configuration Steps**

1. Set up Azure Route Server:
 — Deploy Azure Route Server in a dedicated subnet (`RouteServerSubnet`) in each region’s hub virtual network.
 — Enable branch-to-branch communication on the Route Server to allow route exchange between NVAs and virtual network gateways.

2. Configure NVA:
 — Deploy NVAs in the hub virtual networks.
 — Configure BGP on the NVAs to peer with Azure Route Server.
 — Advertise the anycast IP address (/32) from each NVA to its local Route Server.

3. ExpressRoute or VPN Configuration:
 — Set up ExpressRoute circuits or VPN Gateways to connect on-premises networks to Azure.
 — Ensure that the ExpressRoute or VPN gateways are deployed in the same hub virtual networks as the Route Servers.

4. BGP Peering:
 — Azure Route Server automatically establishes iBGP peering with ExpressRoute and VPN gateways in the same vNet.
 — No manual configuration is needed for this peering.

5. Route Propagation:
 — Azure Route Server learns the anycast route from the NVAs.
 — It then propagates this route to the ExpressRoute gateway, which advertises it to the on-premises network.

6. On-premises Routing:
 — On-premises routers receive the anycast route from multiple Azure regions.
 — They typically use equal-cost multi-path (ECMP) routing to distribute traffic across available paths.

**Health Checks and Failover**

- Implement health checks in the NVAs to monitor the application’s availability.
- Configure NVAs to stop advertising the anycast route if the application becomes unhealthy in their region.
- This prevents traffic from being routed to an unavailable instance of the application.

Traffic Flow and NAT Considerations

1. Inbound Traffic:
 — Traffic from on-premises reaches the NVA in the selected Azure region.
 — The NVA performs either reverse-proxy or Destination NAT (DNAT) to forward traffic to the actual application.

2. Return Traffic:
 — For reverse-proxy setups, return traffic naturally flows back through the NVA.
 — For DNAT setups without SNAT, use User-Defined Routes (UDRs) to ensure return traffic goes through the NVA.

3. Asymmetric Routing Considerations:
 — In multi-NVA setups, be aware of potential asymmetric routing issues.
 — This is especially important for stateful NVAs like firewalls.

### Real-World Application: Anycast for Regional Internet Egress

To illustrate the practical benefits of anycast routing, let’s explore a real-world scenario where it was used to solve a complex networking challenge.

**The Challenge: Global Internet Egress with Regional Constraints**

In a large multinational retail organisation, there was a need to provide regional failover to the closest proxy server for internet egress. This scenario presented several unique challenges:

1. Heritage Services: Many of the existing services using the proxy were not DNS-aware, ruling out traditional DNS-based solutions.

2. Geolocation Limitations: Implementing a geolocation-based solution would have required maintaining a private geolocation database, which was considered too complex for an organisation already struggling with effective and accurate IP Address Management (IPAM).

3. China Region Requirements: Any user in the China region, including visitors, had to use the local egress due to regulatory requirements. This made user-based policies ineffective, especially considering the prevalence of international travel.

4. Global Failover: The solution needed to provide seamless failover to alternative egress points if the primary regional egress became unavailable.

**The Solution: Anycast with F5 LTM and Conditional Route Injection**

To address these challenges, an anycast solution was implemented using F5 Local Traffic Manager (LTM) appliances with conditional route injection. This approach is conceptually similar to the Azure anycast solution using Route Server and NVAs. Here’s how it worked:

1. Anycast IP Address: A single IP address was used globally for the proxy service.

2. Regional F5 LTM Deployment: F5 LTM appliances were deployed in multiple regions, including a dedicated instance in China.

3. Conditional Route Injection: Each F5 LTM was configured to inject the anycast route into the local network only if the proxy service was healthy.

4. BGP Routing: The anycast routes were propagated through the global network using BGP, ensuring that clients always routed to the nearest available proxy.

5. Health Checks: Regular health checks on the proxy services ensured that unhealthy instances would not attract traffic.

**Benefits of the Anycast Approach**

This solution provided several key benefits:

1. Protocol Agnostic: It worked for all services, regardless of their DNS awareness.

2. Automatic Failover: If a regional proxy failed, traffic would automatically route to the next closest healthy instance.

3. Compliance: It ensured that traffic from the China region always used the local egress, meeting regulatory requirements.

4. Simplicity: No need for complex geolocation databases or user-based policies.

5. Seamless for End Users: Users, including travellers, didn’t need to reconfigure their devices when moving between regions.

**Parallels with Azure Anycast Implementation**

This real-world example closely mirrors the anycast implementation possible in Azure using Route Server and NVAs:

- The F5 LTM appliances play a similar role to the NVAs in Azure, F5 LTM is one of the options you can use as your NVA.
- Conditional route injection based on health checks is a key feature in both scenarios.
- BGP is used for route propagation in both cases, with Azure Route Server facilitating this in the cloud environment.
- Both solutions provide a way to implement anycast routing for private network traffic, filling the gap left by DNS-based solutions.

### Advanced Configurations

**Influencing Path Selection**

- Modify BGP advertisements from NVAs to prefer certain regions.
- Use techniques like AS Path prepending to establish deterministic paths from on-premises to Azure workloads.

**Multi-Region Design**

- Deploy applications across Availability Zones within each region for higher availability.
- Use consistent NVA and Route Server configurations across regions for seamless failover.

**Limitations and Considerations**

1. ExpressRoute Limitations:
 — ExpressRoute branch-to-branch connectivity is not supported.

2. VPN Gateway Requirements:
 — Azure VPN gateways must be configured in active-active mode with ASN set to 65515 for proper integration with Route Server.

3. Downtime During Route Server Operations:
 — Creating or deleting a Route Server in a VNet with a virtual network gateway may cause downtime.

4. Route Filtering:
 — Routes with Azure BGP community 65517:65517 are dropped by the ExpressRoute gateway when branch-to-branch is enabled.

### Conclusion

Implementing anycast in Azure using Route Server and NVAs provides a powerful solution for global traffic management in hybrid cloud environments. It offers improved reliability, optimised routing, and enhanced performance for critical applications that require private network connectivity. While more complex than some alternatives, the benefits in terms of flexibility and control make it an attractive option for organisations with demanding global networking requirements.

By leveraging the strengths of Azure Route Server for seamless route propagation and NVAs for traffic management, this solution bridges the gap between on-premises networks and Azure, enabling truly global and resilient application delivery in private network scenarios.
