---

title: "Beyond DNS: Implementing Anycast in Azure with Route Server and NVAs"
authors: simonpainter
tags:
  - azure
  - anycast
  - networks
  - cloud
  - bgp
  - load-balancing
  - high-availability
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

## Why Anycast in Azure?

Before diving into how to set it up, let's talk about why Anycast matters and how it fits with what Azure already offers.

## The Gap in Azure's Global Load Balancing Tools

Azure gives us several ways to distribute traffic globally, like Traffic Manager and Front Door. But these tools have some limitations:

1. Public IP Requirement: They mostly work with public endpoints, so they're not great for private networks.
2. DNS-Based Routing: They rely on DNS, which can be slow to update and doesn't handle long-lived connections well.
3. Protocol Limitations: Some options are built mainly for HTTP/HTTPS traffic, leaving other protocols without good solutions.

## What is Anycast?

Anycast is a network addressing method where the same IP address is assigned to multiple endpoints in different locations. When someone sends traffic to that IP, the network automatically routes it to the "nearest" instance based on the current state of the network.

Think of it like calling a global support number. You dial the same number wherever you are, but you're automatically connected to the call centre closest to you or the one with the least congestion.

### How Anycast Differs from DNS-Based Solutions

With DNS-based routing:
1. Client asks DNS for the address of a service
2. DNS returns what it thinks is the best address based on its rules
3. Client connects to that specific endpoint
4. If that endpoint fails after connection, the client can't easily switch

With Anycast:
1. Client always connects to the same IP address
2. Network routing protocols (like BGP) determine which actual server handles the connection
3. If a server fails, routing tables update and new connections go to the next best server
4. This happens at the network level, not the application level

## Implementing Anycast in Azure

Azure Route Server lets you bring Anycast to your Azure networks. It enables BGP peering between your Network Virtual Appliances (NVAs) and the Azure network, allowing you to advertise the same IP ranges from multiple regions.

Here's what you need:
1. Azure Route Server deployed in each region
2. NVAs that support BGP (like Linux with FRRouting)
3. The same IP address range advertised from NVAs in each region
4. Proper BGP configuration with appropriate weights and AS paths

I'll cover the detailed implementation in a future post, but this approach lets you create truly resilient multi-region services on private networks - something that's been challenging in Azure until now.

## Should You Use Anycast in Azure?

Anycast isn't the right solution for every scenario. Consider it when:

- You need global load balancing on private networks
- DNS-based solutions don't meet your requirements
- Your application needs fast failover between regions
- You're using protocols other than HTTP/HTTPS
- You already have NVAs with BGP capabilities

For public-facing web applications, Azure's existing solutions like Traffic Manager and Front Door are often simpler to implement and maintain. But for complex hybrid architectures with specific requirements, Anycast fills an important gap in Azure's networking capabilities.

Remember that Anycast requires solid networking knowledge, especially with BGP. But the effort can be worth it for the resilience and performance gains it offers across a global network.