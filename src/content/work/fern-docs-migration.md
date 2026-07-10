---
title: Migrating 991 Documentation Pages to Fern
description: Problem, approach, and outcome of moving a large docs platform to Fern.
date: 2026-03-01
company: Commerce
draft: false
---

<!-- TODO(chris): placeholder case study so you can see the layout. Replace
with the real story and only publicly-cleared numbers. Aim for 300–600
words: Problem → Approach → Outcome. -->

## Problem

The existing documentation lived across a sprawling, hand-maintained site
that was slow to update and inconsistent for both readers and the engineers
contributing to it. Links rotted, structure drifted, and there was no clean
path for AI agents to consume the content.

## Approach

We moved the platform to Fern, treating the migration as a product launch
rather than a lift-and-shift. Content was audited and normalized, redirects
were mapped from every legacy URL, and the authoring workflow was rebuilt so
a change is a reviewable pull request.

## Outcome

- **991 pages** migrated with normalized structure and frontmatter.
- **147 pull requests**, each independently reviewable and revertible.
- **4,000+ redirects** so no inbound link broke.

The result is documentation that ships like software — versioned, reviewed,
and readable by humans and agents alike.
