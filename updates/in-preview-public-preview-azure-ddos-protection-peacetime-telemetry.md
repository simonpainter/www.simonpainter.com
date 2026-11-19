---
title: "Public Preview: Azure DDoS Protection peacetime telemetry"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - monitoring
date: 2026-11-19
---

Azure DDoS Protection can now show DDoS-specific traffic metrics for eligible protected public IP addresses during normal operation, not only while mitigation is active. The preview makes it easier to understand the traffic your service sees before an attack.

That gives network and security teams a useful baseline for TCP, UDP, SYN and aggregate traffic. The feature uses existing metrics and doesn't change how Azure detects or mitigates attacks.
<!-- truncate -->

## What it is

Peacetime telemetry extends the availability of existing Azure DDoS Protection metrics to normal operation. You can view incoming, forwarded and dropped traffic, mitigation trigger thresholds, and whether an attack was reported.

It's enabled automatically for supported public IP addresses protected by DDoS Network Protection or DDoS IP Protection. The preview doesn't add new metrics or require a change to your DDoS protection settings.

## Who should care

This is useful if you manage public-facing services and want to understand their ordinary traffic patterns. A baseline can help you investigate unusual changes and make sense of the metrics when a mitigation event occurs.

It also helps teams check what Azure DDoS Protection sees without waiting for an attack. It isn't a replacement for application monitoring: forwarded traffic means DDoS Protection passed it on, not that the application processed it successfully.

## How to view it

In the Azure portal, open **Public IP addresses**, select an eligible protected address, then choose **Monitoring** > **Metrics**. Check that the selected scope is the public IP address you intend to inspect.

For a quick baseline, choose a recent time range, set the time granularity to **1 minute**, and add **Inbound TCP packets DDoS**, **Inbound UDP packets DDoS** and **Inbound SYN packets DDoS** with **Max** aggregation. Add **Under DDoS attack or not** as a separate chart, using the same scope and time range. During normal operation, the traffic charts can have data while the attack-status metric reports **0**.

For an overall view, add **Inbound packets DDoS** or **Inbound bytes DDoS**. To see what was passed on or discarded, compare those with the corresponding forwarded and dropped metrics.

## Gotchas and limits

This is a public preview, and eligibility can vary by region, cloud and IP version. Check Microsoft's [Azure preview terms](https://azure.microsoft.com/support/legal/preview-supplemental-terms/) before relying on the feature.

The DDoS-specific traffic metrics already report rates in packets per second or bytes per second. Don't divide them by 60. Use **Max** for the listed traffic and attack-status metrics. A value of **1** for attack status means an attack was reported at some point in the chart interval; it doesn't necessarily mean one is still active. Missing data isn't the same as zero.

Viewing platform metrics doesn't require a Log Analytics workspace or diagnostic setting. Exporting supported metrics or collecting resource logs is a separate task, and the telemetry preview doesn't change when mitigation logs or notifications are generated.

## Quick takeaway

Peacetime telemetry gives eligible protected public IPs a useful DDoS-specific traffic baseline. Start in Metrics Explorer, check the scope and units, and treat attack status as a separate signal from traffic volume.

## Links

- Official announcement: [Public Preview: Azure DDoS Protection peacetime telemetry](https://azure.microsoft.com/updates?id=581175)
- Learn: [Monitor Azure DDoS Protection](https://learn.microsoft.com/en-us/azure/ddos-protection/monitor-ddos-protection)
- Learn: [Azure DDoS Protection monitoring data reference](https://learn.microsoft.com/en-us/azure/ddos-protection/monitor-ddos-protection-reference)
- Learn: [Azure Monitor metrics explorer](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/metrics-getting-started)
