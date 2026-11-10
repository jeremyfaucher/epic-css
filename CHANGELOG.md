# Changelog

## Unreleased

- Make `npm run build` and `npm run epic-compile` generate full module CSS as `build/<package-version>.css` with a matching source map and embedded Sass sources.
- Verify package-version filename derivation, portable map references, retained older artifacts, and compilation failures. Build commands leave consumer customization and pre-light artifacts untouched.

## 0.14.1

- Preserve all eight consumer palette values assigned before importing the library by declaring fallback colors with `!default`.
- Verify both default colors and consumer overrides through compiled CSS regression checks.
- Document actual palette utilities, source-filter limitations, and the site-first release workflow.
- Limit package contents to Sass source, the two build/filter scripts, regression test and documentation; omit generated pre-light CSS and maps.

Baseline: npm `epic-css@0.14.0`, resolved by the site's existing package-lock integrity `sha512-30vmQqUP1Qo1GXlfUKfLGHn97mJM3IvVtPV1cbOmH3SGaKeMXYgRzhGpmyHdzCRvd7CQk38CXgyDw3k+nZk8YQ==`.
