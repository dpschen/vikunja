# TRLD Cookie Banner Implementation Plan

This document outlines a comprehensive approach to implementing a cookie banner that complies with the requirements summarised in the **DSGVO / TTDSG Cookie Banner – TRLD Cheat-Sheet (2025)**. It is intended for developers and legal/compliance teams who need to integrate a consent management platform (CMP) into the Vikunja ecosystem or any web service built on top of it.

## 1. Legal and Regulatory Basis

1. **Collect valid consent** – Consent for non-essential cookies must be freely given, specific, informed and unambiguous as required by GDPR Art. 6(1)(a) and Art. 7.
2. **Adhere to TTDSG §25** – Prior explicit consent is mandatory before any storage or access on a user device unless a cookie is technically necessary.
3. **Include all identifiers** – According to EDPB Guidelines 2/2023, the rules apply not just to cookies but also to localStorage, fingerprinting and similar technologies.
4. **Respect Planet49 and CNIL decisions** – Pre-ticked boxes or design elements that hide the reject option invalidate consent. The user must actively agree and be able to reject just as easily.

## 2. Banner Design Principles

1. **Symmetry of choice** – Display “Accept all” and “Reject all” buttons on the first layer with equal prominence.
2. **Granular controls** – Offer separate toggles per purpose (e.g. analytics, advertising) and per vendor.
3. **No dark patterns** – Follow EDPB Guidelines 3/2022 and CNIL notices. The reject path must not require extra clicks or be hidden by misleading colours.
4. **Accessible content** – Ensure the banner meets WCAG 2.2 AA standards so that focus is not obscured, controls are large enough and text is clear.

## 3. Technical Implementation Steps

1. **Inventory and classification**
    - List all scripts, tags and cookies in use.
    - Label each item as strictly necessary, analytics, advertising or user-experience.
2. **Select and configure a CMP**
    - Use a Transparency and Consent Framework (TCF) certified CMP if you monetise with ads.
    - Customise colours and contrast to match the rest of the site while ensuring sufficient visibility.
3. **Prior script blocking**
    - Load the CMP before any non-essential scripts.
    - Fire marketing or analytics tags only after consent is obtained.
4. **Event logging and versioning**
    - Assign each consent action a UUID and timestamp and store it in an append-only log.
    - Increment the banner version whenever the vendor list or purposes change and seek new consent.
5. **Record-keeping**
    - Keep logs no longer than necessary (recommendation: maximum three years) while ensuring you can export consent records to supervisory authorities in a structured format.

## 4. User Experience Workflow

1. **First layer**
    - Concise explanation of purposes.
    - Visible links to the privacy policy and imprint.
    - Essential cookies note and the “Accept all” / “Reject all” buttons.
2. **Second layer**
    - Detailed description per purpose and per vendor, including retention periods and legitimate-interest information.
    - Toggle switches for each item.
3. **Withdrawal and proof**
    - Provide a one-click method to change or withdraw consent that is no harder than the initial opt-in.
    - Store who consented, when and to which banner version.

## 5. Governance and Maintenance

1. **Quarterly script audits** – Review and update the inventory every three months or whenever marketing tools change.
2. **Update processes**
    - Maintain an internal playbook for developers on how to add new tools while respecting privacy-by-design principles.
    - Test all banner changes in a staging environment before deployment.
3. **Monitor regulatory updates** – Track guidance from supervisory authorities and adjust the banner and policies accordingly.

## 6. International Transfers

- Check whether any third-country services (e.g. US analytics providers) are triggered by consented scripts.
- If so, implement EU-US Data Privacy Framework mechanisms or Standard Contractual Clauses with transfer impact assessments.

## 7. Accessibility & EAA Compliance

- Use semantic HTML and ARIA roles so the banner is operable via keyboard and screen readers.
- Keep banner interaction clear and easy to understand.
- From June 2025 the European Accessibility Act requires these standards for web services, so incorporate them during development.

## 8. Implementation Checklist

- [ ] Inventory all tags and cookies.
- [ ] Draft purpose texts and map vendors.
- [ ] Choose and configure a CMP.
- [ ] Block scripts until consent is provided.
- [ ] Perform keyboard-only and screen-reader tests.
- [ ] Validate with browser privacy tools and official checklists.
- [ ] Log consent and set retention schedules.
- [ ] Update privacy policy and imprint references.
- [ ] Schedule quarterly audits.
- [ ] Monitor regulatory changes and iterate.


