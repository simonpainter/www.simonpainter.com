---
title: "Generally Available: Azure Front Door mutual TLS authentication"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - zero-trust
date: 2026-11-17
---

Mutual TLS (mTLS) authentication is now generally available on Azure Front Door Premium. Front Door can require client certificates and validate them at the edge, so untrusted requests don't reach your origin.

The GA release also makes trusted CA setup simpler: you can configure only the root CA certificate. Clients then send the intermediate certificates in their TLS handshake, while Front Door builds and checks the chain.

<!-- truncate -->

## What it is

With standard TLS, the client checks the server's certificate. mTLS adds a client certificate, so the service can verify who or what is connecting. Front Door supports four modes: require and validate a certificate, require one without validating it, validate one if presented, or pass it through to the origin.

In the first mode, Front Door checks the certificate at the edge before forwarding the request. You can also configure revocation checks and an allowed SAN/CN list. The other modes let your origin take on some or all of that validation.

## Who should care

mTLS is useful for B2B APIs, IoT devices, and services that need to identify a client by certificate as well as authenticate a user or application. It gives you a way to reject unknown clients before their requests reach your backend.

This is an additional authentication control, not a replacement for application authorisation. Your application still needs to decide what an accepted client can do.

## How to use it

In the Azure portal, open your Front Door Premium profile and add a trusted CA certificate under **Security > Mutual TLS CA certificates**. You can select a Key Vault secret containing only the root CA; clients must then send all required intermediate certificates with their client certificate.

Next, create an endpoint with **Enforce mutual TLS** enabled. Add a custom domain, enable mTLS in its advanced settings, choose a validation mode and CA certificate, then associate the domain with a route and origin group. Test the certificate flow before changing DNS to point the domain at Front Door.

For example, a partner API can use **Client certificate required and validated** and a trusted private root CA. The partner presents a certificate issued by that CA, Front Door validates it, and only then forwards the request to the API origin.

## Gotchas and limits

mTLS is available on Front Door Premium. It requires custom domains: the default `*.azurefd.net` endpoint domain can't be used on routes under an endpoint where mTLS is enabled. Enable mTLS on the endpoint before associating mTLS domains with it, and don't mix domains with different mTLS states on the same endpoint.

Plan changes to existing domains carefully. Moving a domain to an mTLS-enabled endpoint or disabling mTLS can cause downtime, so Microsoft recommends using new endpoints and domains where possible. Caching isn't supported on routes or rule overrides that use mTLS.

The CA configuration accepts a root certificate alone or a root plus up to three intermediates. Certificates must be PEM encoded and under 25 KB. There's no automatic rotation, though you can attach two CA certificates during a rollover. If a client certificate has an Extended Key Usage (EKU), it must allow client authentication. Revocation checks use OCSP.

Restrict origin access to traffic from Front Door as well. Otherwise, a client could bypass the edge checks by connecting directly to the origin.

## Quick takeaway

GA makes Front Door mTLS ready for production on Premium, with the option to trust a root CA without uploading its intermediate certificates. The control is useful when client identity matters at the edge, but endpoint changes, caching limits, and certificate operations need planning.

## Links

- Official announcement: [Generally Available: Azure Front Door mutual TLS authentication](https://azure.microsoft.com/updates?id=577678)
- Learn: [Mutual TLS authentication in Azure Front Door](https://learn.microsoft.com/en-us/azure/frontdoor/mutual-tls)
- Learn: [Secure traffic to Azure Front Door origins](https://learn.microsoft.com/en-us/azure/frontdoor/origin-security)
