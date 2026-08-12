---
title: "Launched: 2.2x IDPS performance optimisation in Azure Firewall"
authors: simonpainter
tags:
  - firewall
  - azure
  - networks
date: 2026-08-12
---

Microsoft has launched a generally available performance boost for Azure Firewall IDPS. The update claims up to **2.2x** better IDPS performance, which is a big deal if you've held back on turning on deep inspection because of throughput concerns.

In plain terms, this gives teams more room to run stronger security controls without the same performance trade-off they had before. If your firewall policy uses IDPS in **Alert and Deny** mode, this launch is worth a close look.

<!-- truncate -->

## What it is

This launch improves how Azure Firewall Premium handles intrusion detection and prevention (IDPS) traffic. IDPS checks traffic against a large rule set to spot known attack patterns, so it adds processing overhead. This optimisation reduces that cost.

Microsoft's current performance guidance already shows that throughput changes a lot based on whether IDPS and TLS inspection are enabled, so this launch is about improving that real-world balance between inspection depth and speed.

Read the announcement here: [Azure update: 2.2x IDPS performance optimisation in Azure Firewall](https://azure.microsoft.com/updates?id=569256).

## Who should care

If you run a hub-and-spoke design with Azure Firewall as your central egress point, this is directly relevant. The same goes for teams in regulated environments where they need to keep IDPS in blocking mode, not just alert mode.

It's also useful for platform teams that saw bottlenecks when inspection was enabled. Better IDPS efficiency can reduce the pressure to scale out as early under the same traffic profile.

## How to use it

You don't need a separate feature flag for this launch. The main step is to review your existing firewall policy and check whether your current IDPS mode now fits your target throughput.

A quick Azure CLI check and update flow looks like this:

```bash
# Inspect current intrusion detection settings
az network firewall policy intrusion-detection list \
  --policy-name my-fw-policy \
  --resource-group my-rg

# Example: set IDPS to Alert and Deny mode
az network firewall policy intrusion-detection add \
  --policy-name my-fw-policy \
  --resource-group my-rg \
  --idps-mode Deny
```

If you use Terraform or Bicep, the same principle applies: keep policy-as-code as your source of truth, then re-test expected throughput after deployment.

CLI reference: [az network firewall policy intrusion-detection](https://learn.microsoft.com/en-us/cli/azure/network/firewall/policy/intrusion-detection?view=azure-cli-latest)

## Gotchas and limits

The 2.2x figure is not a universal guarantee. Your actual gain depends on traffic mix, TLS inspection usage, signature profile, and rule complexity.

Also, don't treat bypass lists as a performance shortcut. Microsoft calls out that bypass rules are not intended to improve throughput performance.

Finally, test for long enough to catch autoscale behaviour. Azure Firewall can take several minutes to scale out, so short tests can give a false sense of headroom.

Useful references:

- [Azure Firewall performance](https://learn.microsoft.com/en-us/azure/firewall/firewall-performance)
- [Azure Firewall Premium features (IDPS)](https://learn.microsoft.com/en-us/azure/firewall/premium-features#idps)

## Quick takeaway

This is a practical Azure Firewall launch. If you've had to choose between stronger IDPS enforcement and predictable throughput, the trade-off should now be less painful.

I'd treat this as a prompt to re-baseline performance tests and confirm whether you can tighten IDPS policy without adding the same capacity overhead as before.
