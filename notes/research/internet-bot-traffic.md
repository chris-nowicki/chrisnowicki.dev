# General web traffic: humans, bots, and AI

Research date: August 28, 2026

## Bottom line

- **Bots in aggregate exceed humans in the strongest recent broad measurement found.** Thales reports that bots produced **more than 53% of web traffic in 2025**, while humans produced **47%**, in the traffic analyzed for its Bad Bot Report ([Thales news release](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report)). This supports “more bots than humans” for Thales-observed web traffic, not a literal census of every Internet request.
- **The evidence does not show AI/LLM crawlers or agents exceeding humans.** Cloudflare reports that identified AI bots other than Googlebot averaged **4.2% of HTML requests in 2025**; dual-purpose Googlebot averaged another **4.5%** but cannot be treated as purely AI traffic because it serves both search indexing and AI training ([Cloudflare Radar 2025 Year in Review](https://blog.cloudflare.com/radar-2025-year-in-review/#while-other-ai-bots-accounted-for-4-2-of-html-request-traffic-googlebot-alone-accounted-for-4-5)).
- **AI automation is growing rapidly, but growth is not majority share.** Thales reports a **12.5× year-over-year rise in AI-driven bot attacks in 2025** ([Thales news release](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report)); Cloudflare reports that AI “user action” crawling grew **more than 21× from January through early December 2025** ([Cloudflare Radar 2025 Year in Review](https://blog.cloudflare.com/radar-2025-year-in-review/#ai-user-action-crawling-increased-by-over-15x-in-2025)). Neither number is AI’s share of all traffic.

## Claim-validity verdict

| Hypothesis | Verdict | Defensible wording |
| --- | --- | --- |
| General web traffic now contains more bots than humans. | **Supported within major vendors’ observed traffic, not proven as an Internet-wide census.** Thales measured **more than 53% bot traffic versus 47% human traffic during 2025** ([source](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report)). Cloudflare separately found that, on **December 2, 2025**, humans generated **47% of HTML requests** and non-AI bots generated **44%**, before separately counted AI bots and Googlebot are considered ([source](https://blog.cloudflare.com/radar-2025-year-in-review/#while-other-ai-bots-accounted-for-4-2-of-html-request-traffic-googlebot-alone-accounted-for-4-5)). | “On two large web infrastructure networks, automated requests have reached or exceeded human requests.” |
| AI/LLM crawlers or agents alone now produce more traffic than humans. | **Not supported.** Cloudflare’s direct comparison puts identified AI bots other than Googlebot at an annual average of **4.2% of HTML requests**, versus humans at **47% on December 2, 2025**; Googlebot’s separate annual average was **4.5%**, but it is dual-purpose ([source](https://blog.cloudflare.com/radar-2025-year-in-review/#while-other-ai-bots-accounted-for-4-2-of-html-request-traffic-googlebot-alone-accounted-for-4-5)). Thales publishes rapid AI-attack growth but no AI share of total traffic in its public release ([source](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report)). | “Bots are the majority; measured AI crawlers are a fast-growing minority.” |
| “Bots,” “LLMs,” and “agents” can be used interchangeably. | **False.** Thales’s bot total includes good, bad, traditional, and AI-driven automation; it reports **40% of all traffic as bad bots**, within the larger **53% bot total** ([official report page](https://cpl.thalesgroup.com/resources/application-security/2026-bad-bot-report)). Cloudflare classifies AI bots by training, search, and user-action purposes and separates dual-purpose Googlebot ([method and results](https://blog.cloudflare.com/radar-2025-year-in-review/#ai-user-action-crawling-increased-by-over-15x-in-2025)). | Keep “all bots” and “AI bots/agents” as separate series and claims. |

## Primary measurements

### Thales / Imperva: broad human-versus-bot split

**Strongest headline:** Bots made up **more than 53% of all web traffic in 2025**, up from **51% in 2024**, while human activity was **47% in 2025** ([Thales news release](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report)). The official report page rounds the split to **53% bots and 47% humans** and reports **40% of Internet traffic as bad bots** ([Thales report page](https://cpl.thalesgroup.com/resources/application-security/2026-bad-bot-report)).

| Field | What the primary source says |
| --- | --- |
| Measuring owner | Thales, publishing the Imperva Bad Bot Report ([official release](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report)). |
| Measurement period | Full-year **2025** bot activity ([methodology statement](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report#methodology)). |
| Population / scope | Data from Thales Threat Research and Security Analyst Services teams, examining applications, APIs, and digital infrastructure globally ([methodology statement](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report#methodology)). The report page describes analysis across industries worldwide ([official report page](https://cpl.thalesgroup.com/resources/application-security/2026-bad-bot-report)). |
| Unit | Traffic/request activity observed and classified by Thales. The report page also says Thales blocked **17.2 trillion bot requests in 2025** ([official report page](https://cpl.thalesgroup.com/resources/application-security/2026-bad-bot-report)); that blocked-request count is context, not the denominator used to derive the traffic shares. |
| Bot definition visible publicly | The public findings distinguish human traffic, bots overall, and bad bots; they describe AI agents as an emerging category alongside traditional good and bad bots ([official release](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report)). |
| Important limitation | The public release does not disclose the total request denominator, included domains/customers, customer weighting, geographic weighting, confidence intervals, or a reproducible request-level dataset. Treat the result as Thales-observed traffic, not a probability sample of the whole Internet. |

### Cloudflare Radar: AI traffic share and purpose

**Strongest AI-share finding:** Across HTML content requested from Cloudflare customers during **2025**, identified AI bots other than Googlebot averaged **4.2% of requests**, ranging from **2.4% in early April to 6.4% in late June**; dual-purpose Googlebot separately averaged **4.5%**, peaking at **11% in late April** ([Cloudflare Radar 2025 Year in Review](https://blog.cloudflare.com/radar-2025-year-in-review/#while-other-ai-bots-accounted-for-4-2-of-html-request-traffic-googlebot-alone-accounted-for-4-5)).

| Field | What the primary source says |
| --- | --- |
| Measuring owner | Cloudflare Radar, using traffic handled by Cloudflare’s global network ([scope](https://blog.cloudflare.com/radar-2025-year-in-review/)). |
| Measurement period | The Year in Review spans **January 1 through December 2, 2025** ([scope and dates](https://blog.cloudflare.com/radar-2025-year-in-review/)). |
| Population / scope | Millions of Cloudflare customer web properties. Cloudflare says its network was present in **330 cities across more than 125 countries/regions** and handled an average of **more than 81 million HTTP requests per second** during the reporting context ([scope](https://blog.cloudflare.com/radar-2025-year-in-review/)). These figures describe Cloudflare’s visibility, not a random sample of websites. |
| Unit | Requests for HTML content, not page views, sessions, unique visitors, bandwidth, or bytes ([AI traffic-share method](https://radar.cloudflare.com/year-in-review/2025#ai-traffic-share)). Cloudflare explicitly warns that these shares differ from Radar views covering all content types ([analysis](https://blog.cloudflare.com/radar-2025-year-in-review/#while-other-ai-bots-accounted-for-4-2-of-html-request-traffic-googlebot-alone-accounted-for-4-5)). |
| Categories | Human, AI bot, non-AI bot, and a separate Googlebot category. AI crawl purposes are training, search, and user action; an undeclared category covers unclear purpose ([purpose definitions](https://blog.cloudflare.com/radar-2025-year-in-review/#ai-user-action-crawling-increased-by-over-15x-in-2025)). |
| Important limitation | Identification depends on Cloudflare’s bot classification and recognized bot identities. Undeclared, spoofed, or human-like automation can be misclassified. Googlebot cannot be assigned wholly to AI because it crawls for search indexing and AI training. Request share also overweights actors that request many pages and must not be presented as a share of users. |

## AI growth measurements: useful, but not composition

- Thales says AI-driven bot attacks grew **12.5× year over year in 2025** ([official release](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report)). The word **attacks** matters: this is neither all AI bot requests nor AI’s percentage of total traffic.
- Cloudflare says user-action crawling, where an AI bot visits a site in response to a user’s chatbot request, grew **more than 21× from January through early December 2025** ([official analysis and definition](https://blog.cloudflare.com/radar-2025-year-in-review/#ai-user-action-crawling-increased-by-over-15x-in-2025)). The series started from the lowest crawl volume among Cloudflare’s three declared AI purposes, so the growth multiple does not imply majority share.
- Cloudflare says AI crawlers generated **20% of Verified Bot traffic in 2025** ([official analysis](https://blog.cloudflare.com/radar-2025-year-in-review/#googlebot-was-responsible-for-more-than-a-quarter-of-verified-bot-traffic)). That denominator is verified bots only, not all web requests, so it should not be used as “AI is one-fifth of the web.”

## Reconciliation and limitations

1. **Request traffic is not people.** Both vendors count machine and human request activity. One human page load can cause many requests; one crawler can issue enormous request volume. None of these findings measures unique visitors.
2. **The vendors observe different populations.** Thales measures traffic in its application-security estate; Cloudflare measures traffic to its customer properties. Large global visibility does not make either one a census of the public web.
3. **The units differ.** Thales presents a web-traffic split but does not publicly expose its denominator. Cloudflare’s AI comparison is explicitly restricted to HTML requests. Do not combine the two providers’ percentages arithmetically.
4. **The bot taxonomies differ.** “Bot” includes benign search crawlers, monitoring, malicious automation, AI training crawlers, search/RAG crawlers, and user-directed agents. The aggregate bot majority is not an AI majority.
5. **Googlebot is ambiguous by design.** Cloudflare separates it because its traffic supports both ordinary search indexing and AI training. Counting all Googlebot traffic as AI would overstate AI share; excluding it entirely would understate AI-related crawling.
6. **Growth and share answer different questions.** A double-digit growth multiple from a small base can coexist with a low single-digit share of requests. Use the Cloudflare share for composition and the Thales or Cloudflare growth multiple only to describe momentum.

## Recommended slide

**Placement:** Insert immediately before the GitBook **“Docs Traffic · GitBook”** slide and Mintlify **“Docs Traffic · Mintlify”** slide. It supplies the broad-web baseline first; the following slides can then show how strongly documentation properties depart from or exemplify that baseline.

### Slide-ready copy

**Title:** The web is machine-majority. AI is not.

**Body:**

> **53% bots / 47% humans**  
> Thales-observed web traffic, full-year 2025
>
> **4.2% identified AI bots**  
> Average share of HTML requests across Cloudflare customers in 2025, excluding dual-purpose Googlebot (**4.5%**)

**Takeaway:** Design for machine consumption, but do not collapse every bot into an LLM or agent.

**Source line:** [Thales, 2026 Bad Bot Report](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report) · [Cloudflare Radar, 2025 Year in Review](https://blog.cloudflare.com/radar-2025-year-in-review/#while-other-ai-bots-accounted-for-4-2-of-html-request-traffic-googlebot-alone-accounted-for-4-5)

**Speaker caveat:** These are request shares observed on two vendors’ customer networks, not unique users or an Internet-wide census. Thales’s majority is all bots; Cloudflare’s identified AI bots remain a minority.

## Primary sources

- [Thales — 2026 Bad Bot Report resource page](https://cpl.thalesgroup.com/resources/application-security/2026-bad-bot-report)
- [Thales — “AI-driven Bot Attacks Surged 12.5x According to Thales Bad Bot Report”](https://cpl.thalesgroup.com/about-us/newsroom/ai-driven-bot-attacks-surged-according-to-bad-bot-report)
- [Cloudflare — 2025 Radar Year in Review overview and methodology](https://blog.cloudflare.com/radar-2025-year-in-review/)
- [Cloudflare Radar — 2025 Year in Review interactive methodology](https://radar.cloudflare.com/year-in-review/2025)
