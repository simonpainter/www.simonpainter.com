---
title: Azure Basic Data Protection
authors: simonpainter
tags:
  - azure
  - business
  - disaster-recovery
  - personal

date: 2026-01-06

---

Way back in the heady days of 2008 when I was working at a sub-prime mortgage lender (true story, it was us) we had a fella who was 'the MI guy' - his job was to produce some lovely management information reports that told the leadership team how well we were doing at lending money to people who couldn't pay it back. While I had quite a bit of involvement in networks we were a small team so I looked after a lot of the server tin as well back then, and that meant changing backup tapes and that sort of stuff (as was the fashion in those days).
<!-- truncate -->

## The MI Guy's Server

As we were financially regulated we had a pretty good set of rules about data protection and backups. Despite being a small operation with the kit hosted on-premise in our office we had a rack at SunGard AS (RIP) in Hounslow where we replicated out data and had tape backups collected by Iron Mountain. We had regular disaster recovery tests and all that good stuff. After one such test the MI guy came looking for me because he had realised that the data in his MI server wasn't as important as the configuration and scripting that he had set up which wasn't included in the backup regime.

> I have a lot of fun memories from that place including the time, at about 5:25pm on a friday, one of the developers came over to say that he had found a button in the main broker facing web application labelled "Delete AD" and had clicked it to see what it did. It turned out that it deleted every object in the DMZ Active Directory domain. He had sat there wondering what to do for 15 minutes (the time delay for replicating changes to the offsite DR domain controllers) before piping up. Good times.

## Configuration Over Data

The MI guy had his own server. It was the bane of my life. It was physical tin (because that was the fashion in those days) and was a bit of a beast. He'd bought it with his own budget and insisted on managing it himself with local administrative privileges. It did some sort of periodic ETL of data from the main business SQL database and then he ran a load of reports from it which went up on the intranet and on various screens around the office. It was probably a bit of a security risk but hey, it was 2008 and we were helping drug dealers buy houses so nobody cared much about security. It was also pretty unlikely it was tiered to the core business processes but it was visible enough to be important.

Anyway, as it was a SQL server we'd set up a backup plan to grab the contents of the data every day. Given that the extracts were from another dataset that was also backed up (every hour) and replicated offsite (in near real-time) this was a bit of a waste of time but the MI guy had insisted on it. What he hadn't thought about was the months of effort he had put into configuring the server, writing scripts to automate the ETL process, and setting up the reporting services. All stuff that he hadn't made any effort to document. It was also a time long before IaC or people doing sensible things like storing stuff in GitHub repos. It didn't help that our friendly MI fella couldn't even guarantee that he had applied all of the various software patches, or even a complete list of what software was installed on the box.

In the end we used a Norton Ghost based solution to image the server on a regular basis so we could restore an exact copy of the server to new tin if it failed. It was a bit clunky, but it worked, and there are now plenty of better ways to do things like this with VM snapshotting and so on.

## Why This Still Matters Today

The reason for this trip down memory lane is that despite the advances in how we manage configuration and infrastructure these days, there are still boxes out there in our environments that were set up by people and cannot easily be recreated if they fail. Our backup strategies are often focussed on the data in databases or unstructured blob storage and there is an assumption that the software can be set up again if needed and data dropped back in from the backups. This is often true but not always. Where we don't have a clear golden base image, a documented configuration and build process, a source code repository, and a way to recreate the environment we are running, we need a way to snapshot the entire system so we can restore it if needed. This is where [Azure Basic Data Protection](https://github.com/Azure/basic-data-protection-for-Azure-VMs) can be quite handy: it gives a basic and low cost way to snapshot an entire VM such that it can be restored later if needed.

## Basic vs Standard: What's the Difference?

Here's how Basic Data Protection compares to the standard Azure Backup offering:

| Feature | Standard/Enhanced | Basic |
| -------- | ------------------- | -------- |
| Used for | Infra + Cyber + Data resiliency | Data resiliency |
| Target Workloads | Workloads requiring enterprise-grade backup features | Workloads requiring basic backup with minimal cost and complexity |
| Scope | Full VM, file/app consistent | VM with supported disks |
| Consistency | App-consistent and/or crash-consistent | Crash-consistent only |
| RPO | 4-12 hrs (Enhanced), 24 hrs (Standard) | 24 hrs |
| Retention | Days-years | Fixed 5 days |
| Pricing | Vault-based + license | Snapshot (~$0.05/GB/mo) |

## When to Use It

Azure Basic Data Protection shouldn't replace a proper backup and disaster recovery strategy. It's also not a substitute for having a well documented and repeatable build process. But it can be a useful safety net for those systems that don't have a proper way to be recreated if they fail.

The cost is low, and the setup is pretty much a boolean (via API and PowerShell at the moment whilst in preview). It gives you a crash-consistent snapshot of the entire VM, so you'll need to assume your data may be in an inconsistent state and have a separate process for restoring data integrity if needed.

## The Bottom Line

Every environment has its "MI guy" systems - those boxes that someone set up years ago, configured by hand, and now nobody quite remembers how they work. Many of them have been rehosted (lifted and shifted) into the cloud with very little change. In an ideal world, we'd have IaC, documentation, and repeatable builds for everything. But we don't live in an ideal world.

Basic Data Protection gives you a cheap insurance policy for those systems. It won't save you from every disaster, but when a VM dies and you discover there's no way to rebuild it, you'll be glad you had a snapshot to fall back on. At roughly five pence per gigabyte per month, it's a small price to pay.
