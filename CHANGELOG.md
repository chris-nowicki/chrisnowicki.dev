# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Migrated navigation to Astro components, with Svelte only used for mobile menu ([#41](https://github.com/chris-nowicki/chrisnowicki.dev/pull/41))
- Fixed active pathname parsing in navigation
- Updated social icons to black instead of grey
- Updated mobile "buy coffee" text to black

### Fixed
- Setup picture now displays in grayscale
- Font styles and software grid layout
- Coffee images display in grayscale by default

### Removed
- Removed unused dependencies and code

## [1.0.0] - 2025-11-05

### Added
- GitHub repository section on the homepage
- New horizon effect wrapper for visual enhancements
- Conference badge to contact page
- Card-based layout for Latest Posts on homepage

### Changed
- **Major site overhaul** with refreshed design ([#37](https://github.com/chris-nowicki/chrisnowicki.dev/pull/37))
  - Refactored hero section
  - Updated maximum page width
  - Enhanced blog page layout
  - Improved Uses page structure
  - Updated mobile styling and navigation menu
- Migrated blog images from Cloudinary to project repository
- Updated mobile styling ([#32](https://github.com/chris-nowicki/chrisnowicki.dev/pull/32))
- Updated navbar logo and section headings to new blue color
- Updated footer link colors and hero button sizes
- Refined navbar link styles

### Removed
- Removed intro text from homepage
- Removed view transitions
- Removed Docker configuration
- Removed navigation underlines
- Removed speaking engagement
- Removed unused tests

## [0.9.0] - 2025-08-07

### Changed
- Updated uses list with current tools and software

### Fixed
- Updated company name to Commerce

## [0.8.0] - 2025-07-22

### Changed
- Updated job title and introduction text

## [0.7.0] - 2025-07-20

### Changed
- Updated dependencies (July 2025)

## [0.6.0] - 2025-06-18

### Changed
- Updated dependencies (June 2025)

## [0.5.0] - 2025-06-02

### Added
- Server-side rendering (SSR) configuration
- Vercel adapter integration

### Changed
- Navbar code refactoring ([#31](https://github.com/chris-nowicki/chrisnowicki.dev/pull/31))
- Updated signature to new blue color
- Updated styling of arrows and category blog tags

### Removed
- Removed unused code

## [0.4.0] - 2025-05-31

### Added
- Conference page functionality ([#30](https://github.com/chris-nowicki/chrisnowicki.dev/pull/30))

### Changed
- Updated Astro configuration for SSR
- May dependency updates ([#29](https://github.com/chris-nowicki/chrisnowicki.dev/pull/29))

## [0.3.0] - 2025-05-15

### Added
- NGINX configuration for improved performance

### Changed
- Migrated from previous server setup to NGINX
- Updated Docker configuration
- Updated Vite configuration for preview hosts

### Fixed
- Docker Compose configuration
- Dockerfile for Astro compatibility

---

[Unreleased]: https://github.com/chris-nowicki/chrisnowicki.dev/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/chris-nowicki/chrisnowicki.dev/releases/tag/v1.0.0
