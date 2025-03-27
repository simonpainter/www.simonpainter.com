---

title: "Beyond DNS: Implementing Anycast in Azure with Route Server and NVAs"
authors: simonpainter
tags:
  - azure
  - anycast
  - networks
  - cloud
  - bgp
date: 2024-12-10

---

Let's explore solutions for global site load balancing.
<!-- truncate -->
## Introduction: The Evolution of Global Load Balancing

Global failover between regional data centres has traditionally used DNS-based global site load balancer solutions like F5 GTM. As companies moved to the cloud, this approach continued with services like [AWS Route 53](cross-region-r53.md) and Azure Traffic Manager. These DNS-based tools direct traffic to the best regional instance of an application.

DNS-based global load balancers handle cross-region failover by providing health checks and IP geolocation-based routing to specific instances. This lets us create region-specific versions of applications, tailor languages, and address data sovereignty requirements.

But DNS solutions aren't great at handling latency or finding the closest instance based on network paths. While Route 53 works on private hybrid networks (though geolocation is awkward there), Azure Traffic Manager only works on the internet. This leaves a gap, especially for companies with complex hybrid cloud setups.

We can fill this gap in several ways:

1. Set up a traditional GTM solution, either on-premises or as a Network Virtual Appliance (NVA), and connect it to your hybrid cloud.
2. Use an Anycast routing solution.
3. Try the [unthinkable](cross-region-r53.md).

I'll focus on the second option: setting up Anycast in Azure with Network Virtual Appliances (NVAs) and Azure Route Server. This approach works well for routing traffic across multiple regions, particularly in private networks where DNS solutions don't work as well.

## Understanding the Need for Anycast in Azure

Before diving into the implementation, it's important to understand why Anycast matters and how it complements Azure's existing offerings.

## The Gap in Azure's Global Load Balancing Solutions

Azure provides several tools for distributing traffic globally, such as Azure Traffic Manager and Azure Front Door. However, these solutions have limitations:

1. Public IP Requirement: They primarily work with public endpoints, making them unsuitable for private network scenarios.
2. DNS-Based Routing: They rely on DNS for routing, which can be slow to propagate changes and doesn't work well with long-lived connections.
3. Protocol Limitations: Some solutions are optimised for HTTP/HTTPS traffic, leaving gaps for other protocols.