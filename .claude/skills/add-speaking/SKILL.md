---
name: add-speaking
description: Add a new speaking engagement entry to src/data/speaking.ts
disable-model-invocation: true
---

Add a new entry to the `speakingData` array in `src/data/speaking.ts`. Collect the following before proceeding — ask if any are missing:

- `date` — ISO format `YYYY-MM-DD`
- `title` — title of the talk, episode, or appearance
- `description` — one-line description (e.g. "Guest appearance on the Foo podcast")
- `category` — array of one or more: `Conference`, `Podcast`, `Community`, `Workshop`
- `link` — full URL to the recording or event page

## Steps

1. Read `src/data/speaking.ts` to see the current entries.

2. Insert the new entry into the array **in descending date order** (most recent first). Find the correct position by comparing dates.

3. The entry shape:
```ts
{
  date: 'YYYY-MM-DD',
  title: 'Title here',
  description: 'Description here',
  category: ['Category'],
  link: 'https://...',
},
```

4. Confirm the insertion with the line number and the surrounding entries so the user can verify sort order.
