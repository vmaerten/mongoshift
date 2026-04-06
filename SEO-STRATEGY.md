# SEO Strategy - mongoshift.dev

> Last updated: 2026-04-06. Reference document for content + SEO roadmap.

## Target keywords

### Tier 1 - High intent, low competition (own these first)

| Keyword | Competition | Content to create |
|---|---|---|
| migrate-mongo alternative | Zero | Comparison page |
| mongodb migration dry run | Zero (open issue #43 on migrate-mongo since 2019) | Blog post + feature page |
| mongodb migration typescript | Low | Blog post |
| mongodb migration drift detection | Zero (we invented this) | Blog post |
| mongodb migration stored logs | Zero (unique feature) | Blog post |

### Tier 2 - Medium competition (months 2-3)

| Keyword | Competition | Content to create |
|---|---|---|
| mongodb migration tool nodejs | Medium | Pillar guide (3000 words) |
| mongodb migration best practices | Medium | Long-form guide |
| mongodb migration CI/CD | Low | Integration guide |
| mongodb migration rollback | Low-medium | Blog post |
| mongodb migration changelog | Low | Blog post |

### Tier 3 - High competition (months 6-12)

| Keyword | Competition | Content to create |
|---|---|---|
| mongodb schema migration | Medium-high | Definitive guide |
| mongodb migration | High | Homepage + pillar content |

## Competitors

| Tool | Stars | Downloads | Weakness we exploit |
|---|---|---|---|
| migrate-mongo | ~1000 | ~200K/week | No dry-run, no TS native, no docs site, no stored logs, no drift detection |
| mongock | ~1600 | N/A (Java) | Java-only, archived, pivoting to Flamingock |
| golang-migrate | ~18K | N/A (Go) | Go-only, MongoDB is second-class |
| liquibase | ~5000 | N/A (Java) | MongoDB needs Pro license, XML/YAML config, massive overhead |

## Content calendar

### Month 1 - Foundation

| Week | Content | Type | Target keyword | Priority |
|---|---|---|---|---|
| 1 | Fix H1 tags + homepage crawlable text | Page updates | mongodb migration tool | P0 |
| 1 | `/guide/mongoshift-vs-migrate-mongo` comparison | New page | migrate-mongo alternative | P0 |
| 2 | Set up `/blog/` in VitePress | Infrastructure | - | P0 |
| 2 | "The Complete Guide to MongoDB Migrations in Node.js" | Blog pillar | mongodb migration nodejs | P0 |
| 3 | "migrate-mongo Alternatives in 2026" | Blog post | migrate-mongo alternative | P0 |
| 4 | "MongoDB Dry Run Migration: Preview Before You Deploy" | Blog post | mongodb dry run migration | P0 |

### Month 2 - Expansion

| Week | Content | Type | Target keyword | Priority |
|---|---|---|---|---|
| 5 | "MongoDB Migration Best Practices for Production" | Blog pillar | mongodb migration best practices | P1 |
| 6 | "MongoDB Migrations with TypeScript: No Loaders Required" | Blog post | mongodb migration typescript | P1 |
| 7 | "MongoDB Migration Rollback: Strategies That Work" | Blog post | mongodb migration rollback | P1 |
| 8 | "MongoDB Migration in CI/CD Pipelines" | Blog post | mongodb migration ci cd | P1 |

### Month 3 - Authority

| Week | Content | Type | Target keyword | Priority |
|---|---|---|---|---|
| 9 | "MongoDB Schema Migration: Why You Need It" | Blog post | mongodb schema migration | P1 |
| 10 | "MongoDB Migration Changelog: Auditable Changes" | Blog post | mongodb migration changelog | P1 |
| 11 | "How to Add Indexes Safely with MongoDB Migrations" | Recipe | mongodb migration add index | P2 |
| 12 | "Testing MongoDB Migrations Locally" | Recipe | testing mongodb migrations | P2 |

## Backlink strategy (zero budget)

1. **npm publish** - highest priority, npm page = strongest backlink
2. **awesome-mongodb** + **awesome-nodejs** GitHub lists
3. **DEV.to cross-posts** with `canonical_url` pointing to mongoshift.dev
4. **migrate-mongo issues** - helpful replies on #43 (dry-run) and #79 (TypeScript)
5. **Google Search Console** - submit sitemap immediately after deploy
6. **MongoDB Community Forum** - answer migration threads
7. **Reddit r/node + r/mongodb** - share guides (not tool)
8. **Stack Overflow** - answer [mongodb]+[migration] questions

## Technical SEO checklist

- [x] Sitemap auto-generated (15 URLs)
- [x] robots.txt with sitemap reference
- [x] Canonical URLs per page (transformHead)
- [x] Meta descriptions per page (frontmatter)
- [x] OG + Twitter cards (dynamic per page)
- [x] JSON-LD BreadcrumbList on every page
- [x] JSON-LD SoftwareApplication on homepage
- [x] Favicons multi-size + apple-touch-icon
- [x] cleanUrls: true
- [x] font-display: swap
- [x] titleTemplate configured
- [ ] Homepage crawlable text (Hero is Vue = invisible to Google)
- [ ] H1 tags with "MongoDB" keyword
- [ ] Google Search Console verification
- [ ] Analytics (Plausible or similar)
- [ ] Comparison page (vs migrate-mongo)
- [ ] Blog section

## Internal linking strategy

```
Blog post (top-of-funnel) --> Guide page (mid-funnel) --> Quick Start (conversion)
                          --> Other blog posts (cluster)
```

Every blog post links to `/guide/getting-started`.
Pillar guide links to all feature pages.
"Alternatives" post links to `/guide/from-migrate-mongo`.

## Realistic timeline

- Weeks 1-4: zero organic traffic (new domain indexing)
- Weeks 4-8: first impressions for long-tail queries
- Months 2-3: initial rankings for "migrate-mongo alternative"
- Months 3-6: page 1 for long-tail keywords
- Months 6-12: page 1 for "mongodb migration nodejs" (if backlinks grow)
