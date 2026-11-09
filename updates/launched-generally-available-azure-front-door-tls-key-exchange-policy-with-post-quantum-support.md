---
title: "Generally Available: Azure Front Door TLS key exchange policies with post-quantum support"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - educational
date: 2026-11-09
---

Azure Front Door now lets you choose which TLS key exchange groups a custom domain can negotiate, including hybrid post-quantum options. The feature is generally available, giving you more control over the balance between newer cryptography and client compatibility.

The policy applies to connections from clients to Front Door, not the separate TLS connection from Front Door to your origin. That distinction matters if you're planning a wider post-quantum migration.
<!-- truncate -->

## What it is

During the TLS handshake, the client and Front Door agree on a key exchange method to establish a shared secret. The new policy controls which methods Front Door offers. Hybrid post-quantum methods combine a classical key exchange with ML-KEM, a post-quantum key encapsulation mechanism.

You can choose **Standard**, **Enhanced** or **Custom** for a custom domain. Standard is the default for new and existing profiles, and includes hybrid groups alongside classical options. Enhanced removes X25519-based methods. Custom lets you select individual supported groups, including X25519.

## Who should care

This is useful if you're preparing for post-quantum cryptography, or if you need to control which key exchanges your clients can use. It also gives teams with strict compatibility requirements a way to tune the policy rather than accept a single fixed set.

Hybrid support doesn't mean every connection will use a post-quantum method. The client and Front Door negotiate a method they both support, so the result depends on the client and the TLS version.

## How to use it

In the Azure portal, open your Front Door profile, go to **Domains**, select a custom domain, and choose its TLS key exchange policy. Select **Standard** or **Enhanced**, or choose **Custom** and select the supported groups you want to allow.

For example, if the domain still accepts TLS 1.2 clients, a custom policy could include `SecP256r1MLKEM768` for hybrid TLS 1.3 handshakes and `prime256v1` for a classical option that also works with TLS 1.2. Check that your clients support at least one allowed group before applying the policy.

The key exchange setting is separate from the TLS policy. Use the TLS policy to configure protocol versions and cipher suites. Azure Front Door also lets you disable `TLS_AES_128_GCM_SHA256` when TLS 1.3 is the minimum version.

## Gotchas and limits

The policy is available for Azure Front Door Standard and Premium custom domains. Default `*.azurefd.net` domains use Standard and can't be customised. Hybrid post-quantum groups require TLS 1.3; if TLS 1.2 is allowed, include a classical group in a custom policy.

This only controls the client-to-Front-Door handshake. If Front Door connects to your origin over HTTPS, that is a separate TLS connection and this policy doesn't configure its key exchange. Post-quantum handshakes also use larger messages, so test representative clients and monitor connection failures and latency after rollout.

## Quick takeaway

Standard is a practical starting point: it's already the default and includes hybrid options. Move to Enhanced or Custom only when your client compatibility or security requirements call for it, and test before changing a production domain.

## Links

- [Azure update: TLS key exchange policy with post-quantum support](https://azure.microsoft.com/updates?id=577668)
- [TLS key exchange policy in Azure Front Door](https://learn.microsoft.com/en-us/azure/frontdoor/tls-key-exchange-policy)
- [Configure an Azure Front Door TLS policy](https://learn.microsoft.com/en-us/azure/frontdoor/tls-policy)
- [TLS encryption with Azure Front Door](https://learn.microsoft.com/en-us/azure/frontdoor/end-to-end-tls)
