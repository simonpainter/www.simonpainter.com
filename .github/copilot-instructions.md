# Blog Writing Tone Guide

## Style Elements
- Use UK English spellings and grammar.
- Use clear, direct language and avoid complex terminology.
- Aim for a Flesch reading score of 80 or higher.
- Use the active voice.
- Avoid adverbs.
- Avoid buzzwords and instead use plain English.
- Use jargon where relevant but always explain it clearly.
- Maintain a conversational tone that sounds like two friends talking at a coffee shop.
- Format content in Markdown.
- Use contractions (don't, won't, can't, etc.) to maintain a conversational flow.
- Use first-person singular pronouns (I, my, me) rather than plural.
- When explaining software processes, use Pythonic pseudocode that's formatted with 4-space indentation.
- For functions outside Python's native library, either clearly label their source (e.g., math.sqrt()) or create self-explanatory function names (e.g., calculate_network_latency()).

## Emotional Tone
- Avoid being salesy or overly enthusiastic.
- Express calm confidence to establish expertise.
- Be informative without being pedantic.
- Maintain a friendly, approachable voice.
- Use analogies and metaphors to explain complex concepts.

## Phrases to Avoid
Avoid formal or overly academic phrases such as:
- "it is worth noting"
- "furthermore"
- "consequently"
- "in terms of"
- "one may argue"
- "it is imperative"
- "this suggests that"
- "thus"
- "it is evident that"
- "notwithstanding"
- "pertaining to"
- "therein lies"
- "utilize" (use "use" instead)
- "be advised"
- "hence"
- "indicate"
- "facilitate"
- "subsequently"
- "moreover"
- "it can be seen that"
- "in the ever changing world of"

## Structure
- Use short paragraphs (2-3 sentences) to break up ideas into key concepts.
- Include subheadings to break up text.
- Avoid overusing bullet points - use paragraphs to explain concepts.
- Use a mix of short, punchy sentences for key points and flowing sentences for explanations.
- Include Mermaid diagrams to visualize concepts where appropriate.
- Support claims with specific data and statistics whenever possible.

## Inclusive Language Rules
- Use gender-neutral language by default (for example, "they", "everyone", "folks", "team").
- Avoid assumptions about age, gender, ethnicity, disability, religion, culture, or family structure.
- Use people-first language unless a group clearly prefers identity-first language.
- Prefer globally clear wording over local idioms, slang, or culture-specific references.
- Describe requirements and behaviours, not personal traits.
- If user wording may exclude people, suggest a neutral rewrite.

### Preferred alternatives
- "guys" -> "everyone" or "team"
- "manpower" or "man-hours" -> "effort", "staffing", or "person-hours"
- "sanity check" -> "quick check" or "sense check"
- "normal user" -> "typical user" or "most users"
- "master/slave" -> "primary/secondary", "leader/follower", or protocol-specific terms
- "blacklist/whitelist" -> "denylist/allowlist" or "blocklist/allowlist"
- "dummy value" -> "placeholder value"
- "grandfathered" -> "legacy status"

## Blog Post Tagging

Every post must have **at most 3 tags**, chosen from `blog/tags.yml`.

**Drop-priority order** — remove these first when trimming:
1. `networks`, `cloud`, `security`, `architecture` — too generic to filter anything useful

**Keep-priority order** — favour tags in this sequence:
1. Technology-specific: `dns`, `bgp`, `expressroute`, `private-link`, `terraform`, `ipv6`, `anycast`, `mcp`, plus other precise tech tags (`firewall`, `zero-trust`, `ospf`, `dhcp`, `sdwan`, `load-balancing`, `high-availability`, `performance`, `troubleshooting`, `monitoring`, `cicd`, `github-actions`, `docusaurus`, `ai`, `algorithms`, `routing-protocols`, `netbox`, `enforza`, `nfc`, `making`)
2. Generic tools: `python`, `bash`, `programming`, `scripting`, `automation`, `github`
3. Platform: `azure`, `aws`
4. Content-type: `opinion`, `educational`, `labs`, `personal`
5. Catch-all: `business`, `career`, `documentation`, `migration`

Only add a tag if it is already defined in `blog/tags.yml`. Do not create new tags without also adding them to `blog/tags.yml`.

## Examples
### Preferred:
"I tested five different approaches last month and found that the simplest one worked best. It's like choosing between a Swiss Army knife and a chef's knife when you need to cut vegetables - the specialized tool wins every time. The data shows a 43% improvement in processing time, with resources cut by nearly half."

### Avoid:
"It is worth noting that upon testing five methodologies, it became evident that the approach characterized by the greatest simplicity yielded optimal outcomes. This approach required less temporal investment, utilized fewer resources, and subsequently produced results of superior clarity."
