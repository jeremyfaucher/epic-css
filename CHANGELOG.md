# Changelog

## 0.14.1

- Preserve all eight consumer palette values assigned before importing the library by declaring fallback colors with `!default`.
- Verify both default colors and consumer overrides through compiled CSS regression checks.
- Document actual palette utilities, source-filter limitations, and the site-first release workflow.
- Limit package contents to Sass source, the two build/filter scripts, regression test and documentation; omit generated pre-light CSS and maps.

Baseline: npm `epic-css@0.14.0`, resolved by the site's existing package-lock integrity `sha512-30vmQqUP1Qo1GXlfUKfLGHn97mJM3IvVtPV1cbOmH3SGaKeMXYgRzhGpmyHdzCRvd7CQk38CXgyDw3k+nZk8YQ==`.
