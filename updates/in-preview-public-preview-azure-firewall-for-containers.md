---
title: "Public Preview: Azure Firewall for Containers"
authors: simonpainter
tags:
  - azure
  - networks
  - firewall
  - security
date: 2026-11-20
---

Azure Firewall for Containers brings Azure Firewall policy to AKS workloads through Kubernetes resources. In public preview, a controller turns those resources into firewall configuration, giving teams a Kubernetes-native way to manage selected pods' outbound access.

That gives platform and security teams a way to control egress by Kubernetes labels rather than treating every workload on a subnet alike. The preview has important network and region limits, so check those before planning a trial.
<!-- truncate -->

## What it is

The Azure Firewall Controller runs on an AKS cluster and watches three Kubernetes custom resources: `AzureFirewall` creates a firewall, `SecurityPolicy` defines rules, and `SecurityPolicyAttachment` connects those rules to a firewall and workload subnets. The controller combines the attached policies and applies them through Azure Firewall.

Rules can select pods or namespaces. Application rules can allow or deny traffic to destinations such as fully qualified domain names (FQDNs); network rules cover protocols, ports and IP addresses. A policy only takes effect when an attachment refers to it, and the selected traffic must pass through the firewall.

## Who should care

This is aimed at teams running AKS who need a consistent way to manage workload egress. For example, a platform team could allow a group of labelled application pods to reach a small set of external services, while keeping other outbound traffic blocked by policy.

It may suit teams that already use Azure Firewall and want Kubernetes-aware policy management. It isn't a replacement for AKS network policies: it adds central firewall controls for traffic routed through Azure Firewall.

## How to use it

Start with an AKS cluster using Azure CNI in your own virtual network, install the Azure Firewall Controller, then create a firewall and its route. Define a policy and attach it only after the AKS subnet routes through the firewall.

This example allows HTTPS to `api.example.net` for pods labelled `app: catalogue`. Apply the policy in the same namespace as the workloads:

```yaml
apiVersion: firewall.networking.azure.io/v1alpha1
kind: SecurityPolicy
metadata:
  name: catalogue-egress
  namespace: default
spec:
  applicationRuleCollections:
    - name: catalogue-https
      refs:
        - podSelector:
            matchLabels:
              app: catalogue
      action: Allow
      egress:
        - name: allow-api
          toPortProtocol:
            - protocolType: HTTPS
              port: 443
          to:
            - fqdn:
                - "api.example.net"
```

Save it as `security-policy.yaml`, then apply it with `kubectl apply -f security-policy.yaml`. Create a `SecurityPolicyAttachment` that references this policy, your `AzureFirewall` resource, and the AKS subnet resource ID; the deployment guide shows the full manifest and setup steps. Configure and verify the route before applying the attachment, or pods can lose outbound connectivity.

## Gotchas and limits

The preview is limited to Azure public cloud in selected regions, including UK South, Central US, East Asia, West Central US, and the two US EUAP regions. Your subscription must have access to the preview in the region you choose.

It handles pod egress only and supports IPv4 only. Azure CNI Overlay isn't supported, and host-network pods use the node IP so you can't select them individually. Each AKS cluster supports one policy attachment and one Azure Firewall, and each firewall can serve only one cluster.

Attaching the first policy changes pod SNAT behaviour so the firewall sees pod IPs. Check custom `ip-masq-agent` settings and preserve AKS's required outbound access before changing routes. As with other previews, don't assume production support or availability; review the preview terms and test in a non-production environment.

## Quick takeaway

Azure Firewall for Containers gives AKS teams a Kubernetes-native way to manage Azure Firewall egress rules. It's worth evaluating if you need pod-aware outbound controls, but start with the network prerequisites and the preview limits rather than attaching a policy to a live cluster.

## Links

- Official announcement: [Public Preview: Azure Firewall for Containers](https://azure.microsoft.com/updates?id=581963)
- Learn: [Deploy Azure Firewall for Containers (preview)](https://learn.microsoft.com/azure/firewall/deploy-firewall-for-containers)
- Learn: [Deploy Azure Firewall for Containers with an ARM template](https://learn.microsoft.com/azure/firewall/quick-create-containers-template)
- [Supplemental terms of use for Microsoft Azure previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/)
