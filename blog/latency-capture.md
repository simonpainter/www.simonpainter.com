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

A little while ago I set out to find a way to measure the overhead that FQDN filtering places on https web traffic. The [results are shared here](https://www.linkedin.com/pulse/comparing-azure-firewall-enforza-https-inspection-analysis-painter-yc7nf/?trackingId=4SToGIPsTAWvIDmHddeMGg%3D%3D) however I thought I would take the opportunity to discuss the methodology here in a bit more detail.
<!-- truncate -->
[The respository contains the tools you will need](https://github.com/simonpainter/capture_latency) to either replicate and confirm my own testing or do your own, perhaps on a wider selection of firewalls. It consists of two scripts, one to capture and one to analyse the captures; this approach is necessary because precise timing is required and I didn't want to tie up the capture box doing analysis until after the captures were completed. The capture script repeatedly connects to an https URL and pulls down the contents of a page and while doing so does a packet capture of outbound https traffic.
The analysis script trawls through the captures and extracts the time to first byte by looking at the [TCP](how-the-internet-works.md#tcp-transmission-control-protocol) streams and noting the timestamps for the begining of the session and first usable byte.

> There are a number of factors that can cause latency through a firewall at this point in the request and that can depend
> on what method of FQDN filtering is being employed. Typically full TLS inspection would take longer as packets have to be
> assembled and decrypted wheras SNI header inspection is less intrusive.

The reason behind this approach is to try to even out the variables. We're not interested in the time to get to the end host, at latency statistic that is typically measured with a simple ping, we're interested specifically in how long it takes for https traffic to get there. Once we have a first byte the rest of the data flow is largely immaterial because once a flow is allowed it is rarely reevaluated mid flow, this means that time to first usable byte is a more effective measure compared to time to complete page retrieval. Variations in the time taken to serve the page could entirely drown out the differences in the times taken to establish the connection, the nuance gets lost when you are shifting a few hundred Kb of data after measuring differences in milliseconds.

I hope you find this useful and do track me down on [LinkedIn](https://www.linkedin.com/in/sipainter/) with the results of your own experimentation.
