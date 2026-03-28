# Simon Painter's Website

[![Deploy to S3](https://github.com/simonpainter/www.simonpainter.com/actions/workflows/merge_main.yml/badge.svg)](https://github.com/simonpainter/www.simonpainter.com/actions/workflows/merge_main.yml)
[![PR Build Check](https://github.com/simonpainter/www.simonpainter.com/actions/workflows/pull_request.yml/badge.svg)](https://github.com/simonpainter/www.simonpainter.com/actions/workflows/pull_request.yml)
[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.simonpainter.com&label=simonpainter.com)](https://status.refriedbean.uk)

A personal blog where I write about cloud networking, infrastructure automation, and the messy reality of moving enterprises from traditional networks to the cloud. It started as my own digital notebook - somewhere to document solutions so I wouldn't have to solve the same problems twice. It's grown into something a bit more useful than that.

## About Me

I'm Simon Painter, a Cloud Network Architect and Microsoft MVP for Cloud and Datacenter Management. I've spent over two decades working on enterprise-scale network and cloud infrastructure, mostly helping organisations figure out what "cloud networking" actually means in practice.

My background is traditional network engineering - retail, finance, enterprise tech. I got pulled into the cloud transformation wave like most people in my field, and found that cloud networking isn't just traditional networking with a shinier interface. It's a different discipline with its own quirks, failure modes, and genuinely interesting problems.

The Microsoft MVP recognition is nice, but the real reward is the occasional message from someone who found a post useful. That's what keeps me writing.

Outside of work I make things - 3D printing, Lego, tinkering with whatever technology has caught my eye that week. I'm based in Yorkshire with my wife, three kids, and our spaniel Mabel.

## What I Write About

Most posts fall into one of these areas:

**Cloud networking** - Deep dives into AWS and Azure networking, usually sparked by something that confused or surprised me. Things like how Azure's magic IPs work, why BGP behaves differently in the cloud, or what actually happens when you peer two VNets.

**Infrastructure automation** - Terraform, CI/CD, and the infrastructure-as-code patterns that actually hold up at scale. I'm opinionated about this stuff and I'll tell you why.

**Network modernisation** - The practical side of moving from MPLS and traditional WAN to cloud-first architectures. SD-WAN, ZTNA, and why the journey is rarely as clean as the vendor decks suggest.

**Algorithms and logic** - Occasionally I write about the computer science basics that underpin network and infrastructure work. Not everyone who manages networks comes from a CS background, and that's fine - but some of this stuff is genuinely useful to know.

**The human side** - Not everything is technical. I write about communication, selling ideas to stakeholders, and the organisational dynamics that determine whether good technical work actually lands.

## The Writing Style

I try to write the way I'd explain something to a colleague over coffee. Plain English, short paragraphs, concrete examples. I use analogies where they help and code where they don't. I'd rather be clear than impressive.

Posts usually include diagrams where the architecture is complex enough to warrant one. I use Mermaid for most of these, which means they're version-controlled alongside the content.

## Technical Stack

The site runs on [Docusaurus 3.x](https://docusaurus.io/), deployed to S3 via GitHub Actions on every push to main. Content is Markdown. Pull requests trigger a build check so I know immediately if something's broken before it ships.

## Contributing

Spotted an error? Have a better way to explain something? Check out the [Contributing Guide](CONTRIBUTING.md) for how to get involved, and the [Code of Conduct](CODE_OF_CONDUCT.md) for the ground rules.

You can also find me on [LinkedIn](https://www.linkedin.com/in/sipainter/) or [GitHub](https://github.com/simonpainter).
