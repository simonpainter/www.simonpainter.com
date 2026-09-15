---
title: "Public Preview: HTTP/3 over QUIC support in Azure Application Gateway"
authors: simonpainter
tags:
  - azure
  - networks
  - performance
date: 2026-09-15
---

Azure Application Gateway now supports HTTP/3 over QUIC in public preview. That gives client connections a faster handshake path and better behaviour when packets drop, especially on mobile and high-latency links.

The big shift is transport. HTTP/3 runs over QUIC (UDP) with TLS 1.3 built in, so the gateway can reduce setup delay compared with older TCP-based flows.

If you're running customer-facing apps and want to shave connection time without redesigning your whole stack, this is worth a look.

<!-- truncate -->

## What it is

This preview adds HTTP/3 support on **Application Gateway listeners**. The frontend can accept HTTP/3 traffic from supported clients, while backend pool communication still uses HTTP/1.1.

HTTP/3 is enabled per listener, not globally for the whole gateway. During preview, you can configure it in the Azure portal or with the REST API.

## Who should care

If your users connect from mobile networks, branch sites, or other links with variable quality, this can help. QUIC avoids TCP head-of-line blocking at the transport layer, so one delayed stream doesn't stall every other stream.

It's also useful for latency-sensitive workloads like logins, checkout flows, APIs, and chat-style interfaces where connection startup time affects user experience.

## How to use it

Start with one internet-facing Basic listener, test with real client traffic, then expand.

In the portal, open your Application Gateway, go to **Listeners**, choose a Basic listener, and enable **HTTP/3**.

For automation, use the Network REST API (`2023-02-01` or later) and set `enableHttp3: true` on the listener:

```json
{
  "properties": {
    "frontendIPConfiguration": {
      "id": "/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Network/applicationGateways/<agw>/frontendIPConfigurations/<frontend-ip>"
    },
    "frontendPort": {
      "id": "/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Network/applicationGateways/<agw>/frontendPorts/<frontend-port>"
    },
    "protocol": "Https",
    "sslCertificate": {
      "id": "/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Network/applicationGateways/<agw>/sslCertificates/<cert-name>"
    },
    "hostName": "app.example.com",
    "requireServerNameIndication": true,
    "enableHttp3": true
  }
}
```

After enablement, Application Gateway advertises support with the `Alt-Svc` header (for example `Alt-Svc: h3=":443"; ma=86400`), and compatible clients can move to HTTP/3.

## Gotchas and limits

This is still preview, so keep the usual preview caution in mind: no SLA, behaviour can change, and you should validate before production use.

Current limits include:

- Multi-site listeners aren't supported.
- IPv6 listeners and mutual authentication aren't supported with HTTP/3 in preview.
- WAF gateways can't use HTTP/3 listeners in preview.
- Public-Private IP Same Port isn't supported for HTTP/3 listeners.
- Azure CLI, Azure PowerShell, and Terraform support is planned for GA (not available in this preview path).

HTTP/3 also needs a TLS policy that supports TLS 1.3, so check your listener TLS policy before rollout.

## Quick takeaway

HTTP/3 over QUIC on Application Gateway is a practical performance upgrade for frontend connections, with minimal architectural change. The preview limits are real, but for suitable non-WAF internet listeners it gives you a clean path to lower connection latency and better resilience on unstable networks.

## Links

- Official announcement: [[In preview] Public Preview: HTTP/3 over QUIC support in Azure Application Gateway](https://azure.microsoft.com/updates?id=571123)
- Learn: [Overview of HTTP/3 support in Azure Application Gateway (Preview)](https://learn.microsoft.com/azure/application-gateway/http3-quic-support)
- Learn: [Application Gateway listener configuration](https://learn.microsoft.com/azure/application-gateway/configuration-listeners#additional-protocol-support)
- Learn: [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/)
