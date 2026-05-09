---
name: update-uses
description: Add or update an item in src/data/uses.ts (coffee, software, hardware, or GitHub sections)
disable-model-invocation: true
---

Add or update an entry in `src/data/uses.ts`. First read the file to show the user the current state of the relevant section, then collect missing fields.

## Sections and their required fields

| Section | Array | Fields | Needs image? |
|---|---|---|---|
| Coffee | `coffeeData` | title, description, imageSrc, link | Yes — `public/uses/<filename>.webp` |
| Software | `softwareData` | title, description, imageSrc, link | Yes — `public/icons/<filename>.png` |
| Hardware | `hardwareData` | title, description, link | No |
| GitHub | `gitHubData` | title, description, link | No |

## Steps

1. Ask which section the user wants to update if not specified.

2. Read `src/data/uses.ts` and show the current entries for that section.

3. Collect all required fields for the section. For `imageSrc`:
   - Coffee images live in `public/uses/` (use `.webp` format, e.g. `/uses/item-name.webp`)
   - Software/app icons live in `public/icons/` (use `.png`, e.g. `/icons/app-name.png`)
   - Remind the user to place the image file in the correct directory before the site is built.

4. Append the new entry at the end of the correct array, matching the existing TypeScript object style (no trailing type annotation needed on the literal).

5. Confirm with the added entry and a reminder about the image file if applicable.
