---
title: "Public Preview: AI Security add-on for Azure Firewall Premium"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - firewall
  - ai
date: 2026-11-17
---

Microsoft has put Azure Firewall AI Security in public preview as a separately licensed add-on for Azure Firewall Premium. It adds controls for inspecting AI requests, transferred files and application traffic, along with a Policy Advisor that surfaces findings for review.

That matters if traffic to AI services passes through your firewall: you can check selected requests for prompt injection, protect sensitive data and add malware and application threat checks. It isn't a switch that covers every flow automatically; you need to select the traffic and configure the protection you want.
<!-- truncate -->

## What it is

AI Security extends Azure Firewall Premium with several security profiles. Prompt Threat Protection checks supported AI requests for direct and indirect prompt injection. Advanced Malware Threat Protection analyses supported files, while Advanced Application Threat Protection checks eligible application requests for exploit attempts. Network data loss prevention (DLP) uses Microsoft Purview to classify and protect sensitive data. Policy Advisor analyses policy configuration and traffic logs to give administrators findings to review; it doesn't change policies for you.

You configure protection profiles in a firewall policy, combine them into a security profile group, and associate that group with application rules. The rule selects the traffic; the profile controls how the firewall checks it.

## Who should care

This is worth a look if your team routes traffic to AI services through Azure Firewall Premium and needs more visibility or control over those requests. It may also suit teams that need to inspect selected file transfers or application traffic, or want help finding gaps in firewall policy.

The add-on doesn't replace your existing firewall rules or Premium protections. It adds another layer for traffic you deliberately scope to it.

## How to use it

During the preview, configure AI Security in the Azure portal. For example, to trial Prompt Threat Protection, enable the add-on on each Azure Firewall Premium firewall using the policy, then create a Prompt Threat Protection profile and add it to a security profile group. Attach that group to an application rule scoped to the clients and AI service you want to protect. Configure TLS inspection on the rule, and make sure clients trust the inspection certificate authority.

Prompt Threat Protection also needs an Azure AI Content Safety resource that the firewall policy can access through a managed identity. Start with alerting in a non-production environment, send supported test requests, and check the firewall logs before considering a blocking mode. An allowed request alone doesn't prove the feature inspected it.

## Gotchas and limits

The preview is available in **East Asia, UK South and West Central US**. Azure Firewall AI Security is a separately licensed add-on for Premium, not a feature of Basic or Standard.

Enabling the add-on on an existing firewall requires downtime, so plan a maintenance window. If a policy is associated with several firewalls, enable the add-on on each one. The Azure portal is the supported configuration method during preview; Azure CLI, PowerShell, Terraform and the REST API aren't supported for this configuration yet.

Inspection depends on the protection profile, matching application rule, traffic path and (for HTTPS) successful TLS inspection. Azure Firewall processes network rules before application rules, so an earlier matching network rule can keep traffic from reaching an application rule with a security profile group. Each capability has its own prerequisites: DLP needs Microsoft Purview policy configuration and a user context, for example.

## Quick takeaway

AI Security gives Azure Firewall Premium a way to apply more specific checks to selected AI and application traffic. The main work is in the policy: scope the right application rules, configure the profiles and verify that inspection is happening. Treat the preview as a planned change, particularly if enabling it means downtime on an existing firewall.

## Links

- Official announcement: [Public Preview: AI Security add-on for Azure Firewall Premium](https://azure.microsoft.com/updates?id=580694)
- Learn: [Azure Firewall AI Security concepts (preview)](https://learn.microsoft.com/azure/firewall/ai-security-concepts)
- Learn: [Configure Prompt Threat Protection](https://learn.microsoft.com/azure/firewall/configure-prompt-threat-protection)
- Learn: [Configure Advanced Malware Threat Protection](https://learn.microsoft.com/azure/firewall/configure-malware-protection)
- Learn: [Configure Advanced Application Threat Protection](https://learn.microsoft.com/azure/firewall/configure-application-threat-protection)
- Learn: [Configure network DLP](https://learn.microsoft.com/azure/firewall/configure-network-dlp)
- Learn: [Policy Advisor in Policy Analytics](https://learn.microsoft.com/azure/firewall/policy-analytics#policy-advisor)
- [Azure Firewall pricing](https://azure.microsoft.com/pricing/details/azure-firewall/)
