---
title: "Public Preview: JWT validation for Application Gateway for Containers"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - zero-trust
date: 2026-11-03
---

If every application behind your gateway checks the same access tokens, you end up repeating authentication logic and keeping it in sync. Application Gateway for Containers can now validate JSON Web Tokens (JWTs) before requests reach those applications.

The feature is in public preview and uses a Kubernetes `AuthPolicy` to validate bearer tokens against an identity provider's signing keys. It gives teams a shared check at the gateway, while leaving application permissions and authorisation where they belong.

<!-- truncate -->

## What it is

JWT validation checks that a bearer token is signed by a trusted issuer, has not expired, and - when configured - contains an accepted audience. Application Gateway for Containers retrieves public signing keys from a remote JSON Web Key Set (JWKS) endpoint over HTTPS.

You attach an `AuthPolicy` to an `ApplicationLoadBalancer`, `Gateway`, `HTTPRoute`, `GRPCRoute` or `MCPRoute`. Policies can cover a whole gateway or a specific route, and routes can override an inherited policy. The gateway rejects requests with missing or invalid tokens instead of forwarding them to the backend.

## Who should care

This is useful if you run services on AKS behind Application Gateway for Containers and want a consistent token check across several applications or routes. It works with Microsoft Entra ID and other identity providers that issue JWT access tokens and expose a reachable JWKS endpoint.

Gateway validation authenticates the caller; it doesn't decide what that caller may do. Your application still needs to check roles, permissions and access to individual resources. Keep that authorisation logic in the application.

## How to use it

The example below protects an existing `HTTPRoute`. Set the issuer, audience and JWKS URI to match your identity provider, and keep the policy in the same Kubernetes namespace as the route.

```yaml
apiVersion: alb.networking.azure.io/v1alpha1
kind: AuthPolicy
metadata:
  name: api-jwt-policy
  namespace: app
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: api
  jwt:
    issuer: https://login.microsoftonline.com/<tenant-id>/v2.0
    audiences:
      - <api-application-client-id>
    jwks:
      remote:
        uri: https://login.microsoftonline.com/<tenant-id>/discovery/v2.0/keys
```

Apply the manifest with `kubectl apply -f auth-policy.yaml`, then check that the policy's `Accepted` condition is `True` with `kubectl get authpolicy api-jwt-policy -n app -o yaml`. Send the access token in the request's `Authorization` header. The Learn guide walks through creating a test Microsoft Entra application and verifying the response.

## Gotchas and limits

This is a preview and uses the Gateway API; the Kubernetes Ingress API isn't supported. The gateway must be able to resolve and reach the JWKS host, and trust its HTTPS certificate. Use HTTPS listeners so bearer tokens are encrypted between clients and the gateway.

Only one `AuthPolicy` can target a resource. A route-level policy replaces an inherited Gateway or `ApplicationLoadBalancer` policy rather than merging with it. An invalid policy fails closed, so check its status conditions if requests stop reaching the backend.

Missing or most invalid tokens get a `401 Unauthorized`; a token with an unaccepted audience gets `403 Forbidden`. Web Application Firewall evaluation happens before JWT validation. For browser clients sending an `Authorization` header across origins, configure CORS to allow that header too.

## Quick takeaway

JWT validation gives Application Gateway for Containers a shared place to verify access tokens before they reach your services. It can reduce repeated checks across routes, but it doesn't replace application authorisation or a WAF. As this is still in preview, review the preview terms and test the policy status and token behaviour before relying on it.

## Links

- Official announcement: [Public Preview: JWT validation for Application Gateway for Containers](https://azure.microsoft.com/updates?id=576382)
- Learn: [JWT validation for Application Gateway for Containers](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/jwt-validation)
- Learn: [Configure JWT validation with the Gateway API](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/how-to-jwt-validation-gateway-api)
- Preview terms: [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/)
