---
title: "Public Preview: Azure Bastion RDP and SSH vision"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - ai
date: 2026-11-19
---

Azure Bastion can now use AI to analyse recorded RDP sessions and SSH command logs, then highlight activity that may need investigation. The RDP vision, SSH vision, and SSH command logging features are in public preview.

This gives security and operations teams a quicker way to find relevant activity in privileged sessions. It doesn't replace the recording or decide whether an action is malicious, but it can help reviewers choose where to look first.
<!-- truncate -->

## What it is

RDP vision analyses graphical session recordings and points reviewers to the time ranges where it found potentially risky activity. SSH vision analyses command logs and points to commands that may need attention. Both provide a session summary, an overall risk level, and categorised findings with severity and confidence levels.

SSH command logging also gives reviewers a record of commands entered during a session. The AI findings and command log complement one another: the findings help focus a review, while the log and recording provide the evidence and context.

Analysis runs after a session ends. For example, if an investigation concerns a change to a virtual machine's firewall, a reviewer can check the session summary and any relevant finding, then open the recording at the indicated time or inspect the SSH command in its log.

## Who should care

This is useful for teams that already record administrator sessions and need to review them for audits, incident investigations, or routine oversight. It may be especially helpful when a small operations team has more recorded sessions than it can reasonably watch from beginning to end.

RDP vision suits teams that administer machines through a graphical desktop. SSH vision and command logs suit teams that manage machines through a terminal. You need the relevant recording or logging enabled for the feature to analyse that protocol.

## How to use it

During preview, configure the feature in the [Azure portal preview](https://preview.portal.azure.com). Your Bastion host must use the **Premium** SKU, be in a supported region, and have a storage container configured for session recordings.

For an existing Bastion host:

1. Open the Bastion resource and select **Settings > Configuration**.
2. Under **RDP Auditing**, enable **Session Recording** and **RDP Vision (Preview)** to analyse RDP sessions.
3. Under **SSH Auditing**, enable **Command Logging (Preview)** and **SSH Vision (Preview)** to analyse SSH sessions.
4. Select **Apply**. The update can take about 10 minutes.
5. After a session ends and analysis completes, open **Settings > Session recordings** and select **View AI analysis** for that session. For SSH, select **View SSH logs** to check a finding against the surrounding commands.

For example, after enabling SSH vision, a reviewer investigating a server configuration change can open the session's AI analysis, follow a flagged command into the SSH log, and check nearby commands before deciding whether the activity needs follow-up.

## Gotchas and limits

The preview requires **Bastion Premium** and is currently available in Central US EUAP, East Asia, East US 2 EUAP, UK South, and West Central US. RDP vision requires session recording; SSH vision requires command logging. Recording is a shared setting for RDP and SSH, so it can't be enabled for only one protocol.

Only sessions recorded after you enable the features are analysed. Sessions made through a native client aren't analysed, and configuration is currently available only through the portal. You also can't customise which behaviours the analysis detects.

These features don't block activity or stop a session while it is in progress. AI may miss risky activity, so use its findings to prioritise review and validate them against the original recording or command log. Standard charges for Bastion Premium and the storage account still apply; Microsoft says billing for the vision features isn't active during the current preview.

## Quick takeaway

RDP vision and SSH vision can make recorded privileged sessions easier to triage, but they're an extra lens on the evidence, not a replacement for it. If you already use Bastion Premium recording, enable the relevant preview feature and test the review workflow with your team before relying on it for an investigation.

## Links

- Official announcement: [Azure Bastion brings AI to privileged session review](https://techcommunity.microsoft.com/blog/AzureNetworkingBlog/from-recordings-to-insights-azure-bastion-brings-ai-to-privileged-session-review/4573409)
- Azure Update: [Public Preview: Azure Bastion RDP and SSH vision](https://azure.microsoft.com/updates?id=580699)
- Learn: [Configure Azure Bastion RDP/SSH Vision (Preview)](https://learn.microsoft.com/en-us/azure/bastion/rdp-ssh-vision)
- Learn: [Record Bastion sessions](https://learn.microsoft.com/en-us/azure/bastion/session-recording)
- Preview terms: [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/)
