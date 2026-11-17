---
title: "Public Preview: JWT validation with Azure Front Door authentication policies"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - zero-trust
date: 2026-11-17
---

Azure Front Door can now validate JSON Web Tokens (JWTs) at the edge, before requests reach your application. Its new authentication policy checks tokens issued by Microsoft Entra ID and can either block invalid requests or log the result while allowing them through.

That gives API teams a shared place to check identity instead of relying on every origin to repeat the same token validation. The feature is in public preview and is available on Azure Front Door Premium.
<!-- truncate -->

## What it is

An authentication policy checks a token's signature, expiry, issuer and audience against the policy configuration. Front Door reads the token from either the `Authorization` or `Proxy-Authorization` request header, then gets the signing key from Microsoft Entra ID's JSON Web Key Set (JWKS) endpoint.

You can attach a policy to a Front Door profile, domain or route. A more specific policy takes precedence: route first, then domain, then profile. Choose **Block** to reject requests that don't meet the policy with `401 Unauthorized`, or **Log** to record validation results while letting requests continue.

## Who should care

This is useful if you run APIs or web applications behind Front Door and want a central check for Microsoft Entra ID access tokens. It can help you move token validation out of repeated edge-facing application code.

JWT validation confirms a caller's token; it doesn't decide what that caller may do. Keep application permissions and resource-level authorisation in your application.

## How to use it

In the Azure portal, open your Front Door Premium profile and create an authentication policy. Select **Microsoft Entra ID**, set the expected issuer and audience, choose `Authorization` or `Proxy-Authorization`, and decide whether to forward validated tokens to your origin. Then associate the policy with the profile, domain or route you want to protect, and wait for deployment to finish.

For example, a caller to `https://api.example.com/resource` sends its Microsoft Entra ID token in the configured header using the `Bearer` scheme. Start with **Log** if you want to review validation results before switching to **Block**; the Learn guide shows the request format.

## Gotchas and limits

The preview requires Front Door Premium and supports tokens issued by Microsoft Entra ID only. Cross-cloud tokens aren't supported. In Azure public cloud, the supported issuer hosts are `login.microsoftonline.com` and `sts.windows.net`.

Decide whether your origin needs the client token. Forwarding it is enabled by default; turn it off if the origin doesn't need it, and Front Door removes the configured token header before forwarding the request.

Client-to-Front Door validation and Front Door-to-origin authentication are separate. If you use managed identity for origin authentication, Front Door uses the `Authorization` header for its origin token. Configure the client policy to read `Proxy-Authorization` in that case, so the two tokens don't collide. Also secure the origin so clients can't bypass Front Door and reach it directly.

This is a public preview without a service-level agreement, and Microsoft doesn't recommend it for production workloads. Review the preview terms and test both valid and invalid tokens before relying on the policy.

## Quick takeaway

JWT validation moves a Microsoft Entra ID token check to Azure Front Door, before a request reaches your origin. Use **Log** to assess the policy, then **Block** when you've confirmed it behaves as intended; keep authorisation and origin protection in place.

## Links

- Official announcement: [Public Preview: JWT validation with Azure Front Door Auth Policy](https://azure.microsoft.com/updates?id=577673)
- Learn: [Validate JSON Web Tokens with an authentication policy](https://learn.microsoft.com/en-us/azure/frontdoor/authentication-policy)
- Learn: [Secure traffic to Azure Front Door origins](https://learn.microsoft.com/en-us/azure/frontdoor/origin-security)
- Preview terms: [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/)
