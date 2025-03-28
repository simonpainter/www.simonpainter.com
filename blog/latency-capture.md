---

title: Using packet captures to measure firewall latency
authors: simonpainter
tags:
  - security
  - python
  - programming
  - networks
  - cloud
  - bash
date: 2025-02-25

---

A little while ago I set out to find a way to measure the overhead that FQDN filtering places on HTTPS web traffic. I've [shared the results here](https://www.linkedin.com/pulse/comparing-azure-firewall-enforza-https-inspection-analysis-painter-yc7nf/?trackingId=4SToGIPsTAWvIDmHddeMGg%3D%3D), but I thought I'd take the opportunity to discuss the methodology in a bit more detail.
<!-- truncate -->
[The repository contains all the tools you'll need](https://github.com/simonpainter/capture_latency) to either replicate and confirm my testing or do your own, perhaps on a wider selection of firewalls. It consists of two scripts, one to capture and one to analyse the captures. I chose this split approach because precise timing is required, and I didn't want to tie up the capture box doing analysis until after the captures were completed.

The capture script repeatedly connects to an HTTPS URL and pulls down the contents of a page. While doing so, it performs a packet capture of outbound HTTPS traffic. The analysis script then trawls through these captures and extracts the time to first byte by looking at the [TCP](how-the-internet-works.md#tcp-transmission-control-protocol) streams and noting the timestamps for the beginning of the session and first usable byte.

> There are a number of factors that can cause latency through a firewall at this point in the request, and that can depend
> on what method of FQDN filtering is being employed. Typically, full TLS inspection would take longer as packets have to be
> assembled and decrypted, whereas SNI header inspection is less intrusive.

I designed this approach to try to even out the variables. I'm not interested in the time to get to the end host - a latency statistic that's typically measured with a simple ping. Instead, I'm interested specifically in how long it takes for HTTPS traffic to get there. 

Once we have a first byte, the rest of the data flow is largely immaterial because once a flow is allowed, it's rarely reevaluated mid-flow. This means that time to first usable byte is a more effective measure compared to time to complete page retrieval. In my testing, I found that variations in the time taken to serve the page could entirely drown out the differences in the times taken to establish the connection. The nuance gets lost when you're shifting a few hundred KB of data after measuring differences in milliseconds.

## Going deeper: The nuts and bolts

If you're curious about how this works under the hood, I'm using `tcpdump` for the packet captures and Python for the analysis. The capture script sets up a clean environment for each test, ensuring that DNS caching and previous TCP connections don't skew the results.

The most challenging part was extracting meaningful timing information from the packet captures. I had to carefully track TCP streams, identify the initial handshake, follow the TLS negotiation, and then pinpoint exactly when application data started flowing back from the server.

When measuring firewall overhead specifically, I ran tests both with direct connections (no firewall) and through various firewalls with different FQDN filtering methods enabled. The difference in time to first byte gives a good approximation of the overhead introduced by the firewall's inspection processes.

## Interpreting the results

When I ran these tests across different firewall solutions, I noticed some interesting patterns:

1. Basic packet filtering firewalls added minimal overhead - usually less than 1ms
2. Firewalls using SNI inspection for FQDN filtering added between 2-8ms of overhead
3. Full TLS inspection could add anywhere from 10-50ms, depending on the implementation

These differences might seem small, but they can add up quickly in environments with many chained services or microservices architectures where dozens of internal calls happen for each user request.

I hope you find this useful! Do track me down on [LinkedIn](https://www.linkedin.com/in/sipainter/) with the results of your own experimentation. I'd love to hear about your findings if you try this with different firewall vendors or configurations.