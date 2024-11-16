
# Azure Virtual WAN: The Promise vs. Reality

Is it as great as Microsoft says or as bad as the customers say?

When Microsoft unveiled Azure Virtual WAN, it was heralded as a revolutionary solution for simplifying complex networking scenarios in the cloud. The vision was compelling: a comprehensive service that would streamline branch connectivity to Azure, enable seamless hub-and-spoke architectures, provide automated routing with simplified security, and offer easy integration with SD-WAN appliances. For organisations grappling with the intricacies of cloud networking, this sounded like a panacea and I know plenty who fell for it. However, as many have discovered, the reality of implementing and managing Virtual WAN has proven far more challenging than initially anticipated.

### The Virtual WAN Architecture

At its core, Virtual WAN is built on a hub-and-spoke architecture. The Virtual WAN Hub serves as the central connection point, orchestrating various networking components. Microsoft offers two flavours: Basic, which supports VPN-only connectivity to branch locations, and Standard, which adds support for User VPN, ExpressRoute, and inter-hub connectivity.

The service comprises several key components. The overarching Virtual WAN Service contains all other elements, including the Virtual WAN Hubs that form the regional cores. These hubs house gateways that facilitate connections to spoke virtual networks, branch sites, and other hubs. Hub Route Tables manage the complex task of routing within and between hubs, while Sites represent branch locations for site-to-site VPN connections.

Virtual WAN supports a range of connectivity options, including Site-to-Site VPN, Point-to-Site VPN for remote users, ExpressRoute for private connectivity, and Virtual Network Peering for connecting Azure resources. This comprehensive approach aims to address virtually all network connectivity scenarios within a single, managed service.

### The Reality: Where Virtual WAN Falls Short

Despite its ambitious goals, Virtual WAN has fallen short of expectations in several key areas. The promise of simplicity has, in many cases, given way to a new layer of complexity. Organisations, particularly those with less mature cloud networking capabilities, often find themselves grappling with a steep learning curve. The service demands significant expertise to configure and manage effectively, requiring users to navigate between multiple management interfaces including the Virtual WAN portal, Azure Firewall Manager, and potentially third-party NVA management tools.

Troubleshooting in Virtual WAN environments can be particularly challenging. The limited visibility into IPsec logging and tunnel status often leaves cloud network administrators struggling to diagnose and resolve issues promptly. This lack of transparency can lead to prolonged outages and frustrated end-users.

Flexibility, or rather the lack thereof, is another pain point for many organisations. Virtual WAN’s managed approach, while designed to simplify operations, can be overly restrictive. Only a select group of certified vendors can deploy Network Virtual Appliances (NVAs) directly within Virtual WAN hubs, limiting options for organisations with specific security or networking requirements. Custom routing is constrained, with all branch connections forced to use the same route table, hampering granular control over traffic flows.

The integration of third-party security solutions, such as Zscaler or CheckPoint, for specific workloads is not as straightforward as one might hope within the Virtual WAN framework. This limitation can force organisations to compromise on their security architecture or implement complex workarounds.

### The Cost Conundrum

Implementing Virtual WAN can also prove to be a costly endeavour. The service requires dedicated resources like ExpressRoute and VPN gateways, which can significantly increase infrastructure costs. Traffic traversing Virtual WAN hubs incurs additional bandwidth charges, potentially leading to unexpectedly high bills for organisations with substantial inter-region data transfer needs.

For companies with existing hub-and-spoke architectures, the migration to Virtual WAN can be a time-consuming and resource-intensive process. The potential benefits often struggle to justify the expense and effort required, especially for smaller organisations or those with less complex networking needs.

### Performance Concerns

Performance issues have also emerged as a concern for some Virtual WAN users. Routing through Virtual WAN hubs can introduce additional latency compared to direct peering between virtual networks. This added delay can be problematic for latency-sensitive applications, potentially impacting user experience and application performance.

Furthermore, throughput limitations can pose challenges for high-bandwidth scenarios. VNet-to-VNet traffic through Virtual WAN hubs is capped at 50 Gbps, which may be insufficient for organisations with data-intensive workloads or those running large-scale analytics operations.

### Feature Gaps

Despite continuous improvements, Virtual WAN still exhibits feature gaps that limit its utility in certain scenarios. The inability to create custom route tables for branch connections restricts traffic management options. BGP functionality is limited, with users unable to change ASN for VPN gateways or use certain reserved ASNs. Support for IPv6 in Virtual WAN hubs and gateways is also limited, potentially complicating network designs for organisations looking to future-proof their infrastructure.

### Azure Route Server: A Pragmatic Alternative

In light of these challenges, many organisations are turning to Azure Route Server as a more straightforward solution to their networking needs. Route Server enables dynamic routing between on-premises networks and Azure through Network Virtual Appliances, offering greater flexibility and control.

Unlike Virtual WAN, Route Server can be deployed in any virtual network, allowing for more customised network designs. It simplifies the integration of third-party NVAs and custom routing solutions, providing network administrators with granular control over routing decisions and policies.

Route Server’s deployment model is more aligned with traditional networking concepts, making it easier for teams to understand and manage. It works seamlessly with existing VNet peering and VPN/ExpressRoute gateways, allowing organisations to leverage their current infrastructure investments.

### The Maturity Factor

Interestingly, Virtual WAN often appeals most to organisations with limited cloud networking experience. The promise of a managed, “hands-off” solution is undeniably enticing. However, these same organisations frequently struggle the most with Virtual WAN’s complexities and limitations.

Less experienced teams may find themselves overestimating Virtual WAN’s capabilities, expecting a level of simplicity that doesn’t materialise in practice. The skill gap can lead to difficulties in troubleshooting issues or optimising configurations. Smaller organisations, in particular, may find it challenging to justify the additional costs and resource requirements associated with Virtual WAN.

### Real-World Challenges

User experiences with Virtual WAN have been mixed, with some reporting unexpected routing behaviours. There have been instances where VPN routes were inexplicably preferred over ExpressRoute, leading to suboptimal traffic patterns. BGP peering with on-premises devices has proven complex for many, requiring significant effort to set up and maintain correctly.

Maintenance impacts have also been a concern, with some users experiencing unplanned downtime during Microsoft-initiated updates to Virtual WAN components. This lack of control over maintenance windows can be particularly problematic for organisations with strict uptime requirements or those operating in regulated industries.

### Conclusion

While Azure Virtual WAN undoubtedly has its place in certain scenarios, it’s crucial for organisations to carefully evaluate whether it truly meets their needs. For many, especially those still developing their cloud networking capabilities, Azure Route Server combined with traditional networking constructs may offer a more practical and flexible approach.

As with any cloud service, the key is to thoroughly assess your specific requirements, consider the long-term implications, and choose the solution that best aligns with your organisation’s skills, resources, and networking strategy. Organisations should also honestly evaluate the maturity of their cloud networking function and whether they have the expertise to fully leverage and manage a complex service like Virtual WAN.

In the end, the promise of simplification through Virtual WAN may be appealing, but the reality often demands a level of expertise and resources that many organisations underestimate. By carefully considering alternatives like Route Server and traditional networking approaches, companies can often achieve their connectivity goals more efficiently and cost-effectively, without sacrificing the flexibility and control they need to support their business objectives.
