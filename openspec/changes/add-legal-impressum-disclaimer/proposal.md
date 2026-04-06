## Why

As an open-source tool displaying German political poll data, gelection is subject to German Telemediengesetz (TMG) requirements for an Impressum, and needs explicit legal disclaimers to protect the project from claims of political bias, party affiliation, or endorsement. Without these, the project is both legally incomplete under German law and potentially exposed to reputational risk.

## What Changes

- Add a legal Impressum page compliant with §5 TMG (German Telemedia Act)
- Add a disclaimer of non-affiliation with any political party displayed
- Add a disclaimer of non-endorsement of any political position or party
- Add an open-source license notice (MIT) with link to source repository
- Add a data source attribution noting poll data comes from dawum.de, not from the project itself
- Add a Datenschutzerklärung (privacy policy) page stating that no user data is tracked, stored, or processed
- Surface footer links to both the Impressum and Datenschutzerklärung pages from the main app

## Capabilities

### New Capabilities
- `legal-impressum`: German Impressum page per §5 TMG with contact details, non-affiliation disclaimer, non-endorsement disclaimer, open-source notice, and data source attribution
- `legal-datenschutz`: German Datenschutzerklärung page declaring that no personal data is collected, tracked, stored, or processed by the site

### Modified Capabilities
- (none)

## Impact

- New route or modal for `/impressum` legal page
- New footer component (or footer link added to existing layout) pointing to the impressum
- Static content only — no data fetching, no new dependencies
- Must remain visually neutral per design principles (no party colors, minimal styling)
