---
title: "Generally Available: Keyless TLS on Application Gateway with Azure Key Vault Managed HSM"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - load-balancing
date: 2026-11-09
---

Azure Application Gateway can now terminate TLS without holding the certificate's private key. With keyless TLS, the key stays in Azure Key Vault Managed HSM, which signs the gateway's TLS handshakes; the feature is generally available.

That matters when policy requires HSM-backed, non-exportable keys but you still want Application Gateway to handle HTTPS termination and web application firewall (WAF) inspection. The gateway uses a managed identity to access the key, while its configuration still includes the certificate's public portion.
<!-- truncate -->

## What keyless TLS changes

Keyless TLS doesn't remove certificates or encryption. Application Gateway still presents the certificate to clients and terminates their TLS connections, but it sends signing operations to Managed HSM instead of storing the private key on the gateway. The HSM returns a signature for the handshake, and the private key never leaves it.

After TLS termination, the gateway can inspect requests with WAF and forward them to backend targets, including over a separate TLS connection. Microsoft announced general availability in its [Azure update](https://azure.microsoft.com/updates?id=577130). Its [keyless TLS overview](https://learn.microsoft.com/azure/application-gateway/keyless-tls-overview) explains the request flow and requirements.

## Who should care

This is useful for teams that need central control of TLS keys, want to limit access to exportable private keys, or need an HSM-backed key for assurance and audit purposes. It keeps key custody in Managed HSM while leaving Application Gateway responsible for TLS termination.

It isn't a switch for every gateway. The documented setup uses Application Gateway v2, a Managed HSM, a user-assigned managed identity with permission to use the key, and a certificate whose public portion is provided to the gateway. Creating the HSM-backed certificate also requires Linux, OpenSSL 3.0.13, and Microsoft's Managed HSM TLS offload library.

## How to use it

The [Microsoft configuration tutorial](https://learn.microsoft.com/azure/application-gateway/keyless-tls) walks through provisioning the HSM, generating the certificate, granting access, and configuring a listener. At a high level, create an HSM-backed key and certificate, grant the gateway's managed identity the **Managed HSM Crypto User** role, and associate that identity with Application Gateway.

Then add the HSM key reference and base64-encoded public certificate to an Application Gateway SSL certificate. For example, the Azure CLI command uses this shape:

```bash
az network application-gateway ssl-cert create \
  --resource-group "$RESOURCE_GROUP" \
  --gateway-name "$APPGW_NAME" \
  --name mhsm-cert \
  --hsm keyId="https://<HSM-NAME>.managedhsm.azure.net/keys/<KEY-NAME>" \
        publicCertData="<BASE64-PUBLIC-CERTIFICATE>"
```

Replace the placeholders with your resource names, key URL, and encoded public certificate. Create or update an HTTPS listener to use `mhsm-cert`. Scope the HSM role assignment to the specific key where possible, and enable Managed HSM diagnostics to review signing operations.

## Gotchas and limits

The listener must use TLS 1.2 or later. Supported SSL policies are `AppGwSslPolicy20220101`, `AppGwSslPolicy20220101S`, and `CustomV2`. The current tutorial lists Application Gateway Ingress Controller (AGIC), WebSockets, L4 TCP/TLS proxy, FIPS mode, and EC keys as unsupported.

Each TLS handshake relies on a signing operation from Managed HSM, so check the [Managed HSM scaling guidance](https://learn.microsoft.com/azure/key-vault/managed-hsm/scaling-guidance) and [service limits](https://learn.microsoft.com/azure/key-vault/managed-hsm/service-limits) as part of capacity planning. If you replace a certificate on the HSM object and the gateway doesn't pick up the change, Microsoft says to make another small gateway change or remove and re-add the HSM reference in separate operations.

## The takeaway

Keyless TLS gives Application Gateway a way to terminate HTTPS while the private key stays inside Managed HSM. It suits deployments with strict key-custody requirements, provided the TLS policy, gateway integration, HSM permissions, and signing capacity all fit the documented limits.
