# SpendSight QA Checklist

Use this script before shipping a release or validating a local build.

## Functional

- [ ] Upload sample PDF, CSV, and XLSX statements. Verify the parsing preview shows normalised transactions.
- [ ] Confirm category rules auto-apply to matching transactions and manual categories persist.
- [ ] Run optional LLM classification (if endpoint configured) and ensure toggle in `/settings` hides the button when disabled.
- [ ] Review recurring and new merchants lists for accuracy on the sample dataset.
- [ ] Exercise each visualisation tab (category, daily, recurring, merchants, trend) without runtime errors.

## Export

- [ ] Generate an Excel export and open it locally—each sheet (Raw, Categorised, Recurring, NewSpends, Summary, CategoryRules) should be populated.
- [ ] Generate a PDF export and verify the summary text plus chart snapshot (if rendered) appear.

## Privacy

- [ ] Toggle LLM assistance on/off in `/settings` and confirm the categorisation workspace reflects the change.
- [ ] Use “Clear local data” and verify saved rules/preferences disappear after reload.
- [ ] Reload the app offline to confirm previously loaded scripts function (parsing, categorisation, exports).

## Automated

- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`

Document any deviations or new issues discovered during the run and attach supporting artefacts to the release notes.


