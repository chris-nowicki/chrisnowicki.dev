# Gauge Agent Led Growth: documentation-source claims

Research date: August 29, 2026

## Bottom line

Gauge's **55% documentation** figure is usable only as a clearly attributed
observation from its own **500-run sample of coding-agent workflows**. It is not
an independent or general measure of how all AI agents research. Gauge has not
published enough methodology to reproduce or generalize the result.

## What the source says

The direct source is the supplied [Gauge *Agent Led Growth*
presentation](../../../../Downloads/Gauge%20-%20Agent%20Led%20Growth%20%281%29.pdf),
p. 18. Its chart is captioned: “% of web fetches by source. # of runs = 500.”

| Source category | Share of web fetches |
| --- | ---: |
| Docs | 55% |
| Source code | 18% |
| Package registries | 11% |
| Third-party content | 5% |

The next page (p. 19) further breaks down documentation sources in the same
500-run sample: setup 26%, README 18%, quickstart 15%, API reference 13%,
package registry 11%, and dependencies 1%.

Gauge's current official product page says it runs coding agents in real
repositories and records tool calls, network requests, web searches, judgments,
and final installations. It also says it runs a common implementation task
across Claude Code, Codex, and Cursor. This supports the broad description of
the work as coding-agent testing, but **not** the detailed statistics or a
reproducible study design. [Gauge Agent Led Growth](https://www.withgauge.com/agents)

## Methodology and limitations

Known:

- The denominator is 500 runs; the metric is web fetches by source category.
- The product tests coding agents in repositories, including Claude Code, Codex,
  and Cursor.

Not publicly disclosed:

- When the 500 runs occurred; which models, versions, repositories, tasks, or
  prompts were used; how many runs each agent received; or raw fetch counts.
- How source categories were classified, whether they are mutually exclusive,
  and what the unlisted categories were.
- Sampling method, weighting, error bounds, and a public dataset.

The displayed categories total 89%, so 11% of web fetches are not explained on
the chart. That makes it especially important not to present the four listed
categories as exhaustive.

## Recommendation for *Documentation in the Age of AI*

Do **not** add a standalone evidence slide based on this chart. The existing
deck already establishes the core claim with stronger, more directly relevant
traffic evidence. If the Gauge finding is helpful as a supporting speaker-note
example, use this precise wording:

> In Gauge's 500-run sample of coding-agent workflows, documentation accounted
> for 55% of recorded web fetches. Their detailed methodology is not public.

Avoid: “agents consult docs 55% of the time,” “docs are every agent's primary
source,” or any claim about non-coding agents. If shown on a slide, include the
source line: “Gauge, *Agent Led Growth* presentation, p. 18; vendor sample,
detailed methodology not published.”

## Sources

- [Gauge, *Agent Led Growth* presentation, p. 18](../../../../Downloads/Gauge%20-%20Agent%20Led%20Growth%20%281%29.pdf)
- [Gauge Agent Led Growth product page](https://www.withgauge.com/agents)
