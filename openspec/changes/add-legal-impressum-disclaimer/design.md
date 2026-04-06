## Context

gelection displays German Bundesland and federal parliament polling data. Under German law (§5 Telemediengesetz / TMG), any "geschäftsmäßiger" or publicly accessible web service must provide an Impressum with contact information. Beyond legal compliance, the project needs explicit disclaimers protecting it from claims of political bias or party affiliation, which is particularly sensitive given the subject matter.

The app is a static SPA (React + Vite) deployed as a single-page app. No server-side rendering. All content is static HTML/JS.

## Goals / Non-Goals

**Goals:**
- Satisfy §5 TMG Impressum requirements with required contact information
- Add non-affiliation and non-endorsement disclaimers in German (primary) with English notes
- Add open-source license (MIT) attribution
- Add data source attribution (dawum.de)
- Surface impressum via a persistent footer link

**Non-Goals:**
- Full privacy policy / Datenschutzerklärung (separate concern, separate change)
- Cookie consent / GDPR banner
- Multi-language i18n infrastructure
- Server-side or dynamic legal content

## Decisions

### 1. Route vs. Modal

**Decision**: Dedicated `/impressum` route (React Router page), not a modal.

Rationale: Impressum pages are expected to be directly linkable under German law. A modal cannot be bookmarked or linked to directly. A separate route also keeps the legal content cleanly isolated from the app.

Alternatives considered: Modal overlay — rejected because it breaks direct linking and is not standard Impressum UX in Germany.

### 2. Footer placement

**Decision**: Add a minimal footer to the main app layout with a single "Impressum" link.

Rationale: The footer is the universal, expected location for the Impressum link in German web conventions. It should be minimal to avoid competing with the data-first layout.

Alternatives considered: Top nav link — rejected as it elevates legal boilerplate above functional navigation.

### 3. Content language

**Decision**: Impressum content in German as primary language, with a brief English parenthetical for the disclaimer sections.

Rationale: §5 TMG applies to German-language services. German-speaking users expect German legal text. The disclaimer about non-affiliation is also relevant for international visitors so a brief English version is useful.

### 4. Static content, no CMS

**Decision**: Hard-code impressum content as a React component with static JSX.

Rationale: Legal text changes infrequently and does not require dynamic data. No dependency needed.

## Risks / Trade-offs

- [Placeholder contact info] → The Impressum requires real contact details (name, address, email). The implementation will include placeholder text that the project maintainer must fill in before deployment. A visible TODO comment will be added.
- [Legal accuracy] → This implementation provides the standard structure; the maintainer should verify with a German lawyer that it satisfies their specific situation (particularly if hosted commercially vs. as a hobby project).
- [Route conflicts] → If the app later adopts hash-based routing, the `/impressum` route approach may need adjustment. Mitigation: use React Router's standard `<Route>` which is already used in the project (verify routing setup before implementation).
