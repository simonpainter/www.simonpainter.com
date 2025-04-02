---

title: Azure Latency Part 2
authors: simonpainter
tags:
  - azure
  - networks
  - cloud
date: 2025-03-25

---

## Azure TCP Connection Latency: What I Learned After Three Weeks of Testing

I've spent the last few weeks testing TCP connection latency in Azure. It's been quite the journey! I set up a simple echo server and client to measure round-trip times across different network configurations. The results surprised me - especially when it comes to how we connect across regions.

## What I Tested

I created a test setup using:

- A simple TCP echo server using xinetd on port 7
- A Python client that sends packets and measures round-trip time (RTT) with microsecond precision
- Long-lived TCP connections sending data every few seconds
- Tests across various Azure networking configurations

My tests covered everything from same-host communications to trans-Atlantic connections between UK and US West. I compared different connection methods including direct peering, load balancers, and private endpoints.

## The Results

Let's look at what I found:

### Local Network Performance

| Scenario | Avg RTT | Notes |
|----------|---------|-------|
| Same Host (Network Stack) | ~230μs | Just going through the VM's network stack |
| Same AZ, Same VNET | ~900μs | Baseline for Azure networking |
| Same Region, Cross-AZ | ~1550μs | About 2x the same-AZ latency |
| Cross-Region (UK South to UK West) | ~5300μs | About 6x the same-AZ latency |

The pattern is clear - physical proximity matters a lot. Each additional network boundary adds latency.

### The Load Balancer Effect

Something I found interesting was how load balancers affect latency:

| Scenario | Direct Connection | With Load Balancer | Difference |
|----------|-------------------|-------------------|------------|
| Same AZ | ~900μs | ~1100μs | +200μs |
| Cross-AZ | ~1550μs | ~1850μs | +300μs |

Load balancers add some overhead - typically 200-500μs. That's not much for most applications, but it's good to know if you're optimizing for ultra-low latency.

### Trans-Atlantic Connection Methods

This is where things got really interesting. Look at the difference between connection methods when going from UK to US West:

| Connection Method | Avg RTT | Compared to Direct Peering |
|-------------------|---------|---------------------------|
| Direct Peering | ~145ms | Baseline |
| Load Balancer | ~140ms | 5ms faster! |
| Private Endpoint | ~141ms | 4ms faster! |

That 5ms improvement might not sound like much, but it's significant - it's about the same as the entire latency between UK South and UK West regions! And the improvement was consistent across hundreds of thousands of packets over several days of testing.

## Why This Matters

If you're building applications that communicate across Azure regions, especially over long distances, how you connect those services can make a noticeable difference:

1. **For latency-sensitive applications**: A 5ms improvement can matter for applications like trading platforms or real-time collaborative tools.

2. **Connection method choice**: Using load balancers or private endpoints for cross-region connectivity might give you better performance than direct peering.

3. **Connection setup costs**: The first packet in a connection always takes longer. For short-lived connections, this overhead becomes important.

## My Testing Setup

If you want to run similar tests, I've made my testing tools available. The setup includes:

- A server script that configures xinetd to run an echo service
- A Python client that measures RTT with microsecond precision
- CSV output for detailed analysis

## Key Takeaways

After all this testing, here's what I'd recommend:

1. **Keep related services in the same AZ** when possible - crossing AZs doubles your latency.

2. **Consider load balancers or private endpoints for cross-region communication** - they might actually improve performance over direct peering.

3. **Connection pooling helps** - the first packet has much higher latency, so reusing connections is beneficial.

4. **Test your specific scenario** - network performance can vary, and your mileage may vary too.

Have you noticed similar patterns in your Azure networking? Or have you found other tricks to reduce latency? Let me know in the comments!

---

*All tests were performed in March-April 2025 on standard Azure VMs across multiple regions. Your results may vary based on network conditions, VM types, and Azure infrastructure changes.*
