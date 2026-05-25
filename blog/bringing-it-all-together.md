---
title: "Bringing it all together for network automation"
authors: simonpainter
tags:
  - cloud
  - aws
  - azure
  - networks
  - terraform
  - automation
  - architecture

date: 2025-08-18

---

I have been working on a comprehensive approach to bringing network automation and documentation into a development style workflow. Rather than replacing the traditional ITSM approach to change management it moves infrastructure towards a CI/CD approach to releases with automation and baked in documentation.

<!-- truncate -->

Organisations already living in the cloud will likely have moved to using terraform for orchestration, it has rapidly become the de-facto industry standard for infrastructure as code. I am slightly concerned about the [recent IBM acquisition](https://newsroom.ibm.com/2025-02-27-ibm-completes-acquisition-of-hashicorp,-creates-comprehensive,-end-to-end-hybrid-cloud-platform) but not enough to declare it dead like some of the pundits have.

Terraform allows for a more declarative approach to infrastructure management, enabling teams to define their infrastructure as code and version control it alongside their application code. By aligning your infrastructure code with your business services you can get away from the 'tshirt sizing' of networks and into a more [granular approach where features are turned on and off to create capabilities](modular-networking.md). A large number of terraform providers now exist for on premise networking and key areas around [SDWAN](sdwan-strategic-step-to-ztna.md), on premise access layer, and data center networking are all well covered with strong offerings from the likes of Cisco, Fortinet, Arista, and Juniper. The same principles of Cloud automation with IaC are gradually being applied to on-premise environments as well with the datacentre, SDWAN and finally the access layer targeted.

```mermaid
flowchart TB
    accTitle: Bringing it all together for network automation: flowchart diagram 1
    accDescr: The diagram above shows how a common layer of terraform with multiple providers can be used to manage the various areas of the network.

    TF[Common Terraform Layer]

    subgraph Providers[Terraform providers]
        P1[Terraform Provider<br/>Cisco Meraki]
        P2[Terraform Provider<br/>Cisco ACI]
        P3[Terraform Provider<br/>Juniper Mist]
        P4[Terraform Provider<br/>Other Vendor Hardware]
    end

    subgraph Areas[Managed areas]
        A1[LAN]
        A2[SDWAN]
        A3[Datacentre]
    end

    TF --> P1
    TF --> P2
    TF --> P3
    TF --> P4
    TF --> A1
    TF --> A2
    TF --> A3
```
The diagram above shows how a common layer of terraform with multiple providers can be used to manage the various areas of the network. This allows for a consistent approach to managing the network infrastructure, regardless of the vendor or technology in use. To get the best of the situation you can use a version control system such as Github to manage the code pipelines so that approved pull requests automatically commit the configuration changes to the appropriate environment. This helps to ensure that the network infrastructure is always in a known and consistent state, making it easier to manage and troubleshoot.

Now what for the physical elements of networking? The luxury of the cloud has always been that you are divorced from the cables strung across data halls or even for the most part the cross connects and WAN. If you want to extend this model to the physical layer then you need to have a single source of truth for your physical network and its components. [Netbox has a powerful terraform provider](netbox-terraform.md) which can be used to manage your physical connections in the same way as you do your logical ones. If you take a [documentation first approach](documentation-first.md) to your physical network then netbox becomes the single inventory of physical network components, their locations, their physical connectivity and their relationships to other components. It's powerful enough to manage the physical components of your compute layer too and your DC Ops team will thank you for it.

```mermaid
flowchart TB
    accTitle: Bringing it all together for network automation: flowchart diagram 2
    accDescr: The workflow for physical changes follows similar to config changes - a branch is created with specifics of the physical changes to be made.

    TF[Common Terraform Layer]

    subgraph Providers[Terraform providers]
        P1[Terraform Provider<br/>Vendor Hardware]
        P2[Terraform Provider<br/>Vendor Hardware]
        P3[Terraform Provider<br/>Vendor Hardware]
        P4[Terraform Provider<br/>Netbox]
    end

    subgraph Areas[Managed areas]
        A1[LAN]
        A2[SDWAN]
        A3[Datacentre]
    end

    TF --> P1
    TF --> P2
    TF --> P3
    TF --> P4
    P4 --> A1
    P4 --> A2
    P4 --> A3

    classDef netbox fill:#e1f5fe,stroke:#1976d2,stroke-width:3px;
    class P4 netbox;
```
The workflow for physical changes follows similar to config changes - a branch is created with specifics of the physical changes to be made. Implementation teams perform the physical cabling or installation work necessary and merge in any additional detail they need to capture (circuit information, patch panel information and the like) and then merge the finished request back into the main branch when complete. The history of the request and its implementation can be tracked through the git history, providing a clear audit trail of changes made to the physical network.

```mermaid

gitGraph
      accTitle: Bringing it all together for network automation: gitGraph diagram 3
      accDescr: This gitGraph diagram shows request and implementation.
    commit
    branch request
    checkout request
    commit
    commit
    branch implementation
    checkout implementation
    commit
    checkout request
    merge implementation
    checkout main
    merge request

```
While a combination of netbox and self documenting IaC can be good for painting a picture of your infrastructure there is likely to be some additional documentation required, both for internal consumption and external to application teams and end users. This could include high level architecture diagrams, detailed design documents, and operational runbooks to help teams understand and manage the infrastructure effectively. Combining this into the same workflow with markdown means that changes to the code can be backed with changes to the documentation at the same time. The approval workflow requires both so it never gets lost and the diff in github provides a clear view of what has changed in the documentation as well as the code.

```mermaid
flowchart TB
    accTitle: Bringing it all together for network automation: flowchart diagram 4
    accDescr: This flowchart diagram shows Common Terraform Layer, Markdown Documentation, Feature Module, and Terraform Provider.

    subgraph Code[Code]
        TF[Common Terraform Layer]
        MD[Markdown Documentation]

        subgraph Modules[Terraform modules]
            Module1[Feature Module]
            Module2[Feature Module]
            Module3[Feature Module]
            Module4[Feature Module]
            Module5[Feature Module]
        end

        subgraph Providers[Terraform providers]
            P1[Terraform Provider<br/>Vendor Hardware]
            P2[Terraform Provider<br/>Vendor Hardware]
            P3[Terraform Provider<br/>Vendor Hardware]
            P4[Terraform Provider<br/>Netbox]
        end
    end

    subgraph Areas[Managed areas]
        A1[LAN]
        A2[SDWAN]
        A3[Datacentre]
    end

    TF --> MD
    TF --> Module1
    TF --> Module2
    TF --> Module3
    TF --> Module4
    TF --> Module5
    TF --> P1
    TF --> P2
    TF --> P3
    TF --> P4
    Module1 --> A1
    Module2 --> A2
    Module3 --> A3

    classDef docs fill:#e1f5fe,stroke:#1976d2,stroke-width:3px;
    class MD,Modules docs;
```
Finally organise your code into feature based modules rather than technology or vendor based configuration and you have a structured repository which can be scaled easily.

This approach allows for the physical elements of on premise networking while maintaining workflow patterns similar to cloud and cloud networking. It allows for repeatable [modular networking](modular-networking.md) that can be aligned to business functions rather than tech stacks and it provides a clear path for managing change and documentation across the entire stack.
