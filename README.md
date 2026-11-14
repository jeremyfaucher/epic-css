# Epic CSS

A Sass utility library with an optional source-class CSS filter. Install with `npm install epic-css sass`, or use the [Eleventy starter](https://github.com/jeremyfaucher/epic-css-11ty-theme). See [the live color lesson](https://epiccss.com/docs/colors/) for examples.

**Changelog / Release History:** the [Epic CSS changelog](https://epiccss.com/docs/changelog/) documents previous releases, new features, improvements and bug fixes, newest first.
## Choose a named palette

In the maintained site or Eleventy starter, open `src/my-epic-css/_custom.scss` and change one setting:

```scss
$palette-name: "Neon"; // Harbor, Dusk or Neon
```

Recompile Sass to apply the selection. Harbor is blue, Dusk is charcoal/lavender, and Neon uses coral and teal accents. The preset map and its semantic wiring select the colors together; you no longer switch palettes by commenting individual color assignments in and out. Edit a named map entry when you want to adjust that preset.

The starter provides a static palette. The workshop site provides complete light/dark variants and its own runtime toggle. Selecting a preset is a build-time choice; switching light/dark within that preset is a separate runtime feature.

### Set up palettes in a plain npm project

The preset catalog belongs to consumer customization files; `npm install epic-css` alone does not supply Harbor, Dusk or Neon. For a new consumer, import your custom settings before the library in `src/my-epic-css/index.scss`:

```scss
@import "custom";
@import "../../node_modules/epic-css/src/index";
```

Use this complete static-palette setup in the adjacent `_custom.scss`. After setup, change only `$palette-name` to choose among the three records:

```scss
$palette-name: "Harbor" !default;

// PRESETS — eight semantic roles; "white" always stays white.
$palettes: (
  "Harbor": (
    body: #ffffff, body-bg: #0f172a,
    primary: #4f9eea, primary-light: #93c5fd, primary-bg: #1e293b,
    secondary: #94a3b8, secondary-bg: #1c1f2c, "white": #ffffff
  ),
  "Dusk": (
    body: #f4f2f8, body-bg: #201f2b,
    primary: #b09aee, primary-light: #d3c5ff, primary-bg: #302a42,
    secondary: #c3bfd0, secondary-bg: #282731, "white": #ffffff
  ),
  "Neon": (
    body: #ffffff, body-bg: #000000,
    primary: #ff7956, primary-light: #ffb39d, primary-bg: #202020,
    secondary: #63dacb, secondary-bg: #282828, "white": #ffffff
  )
);

@if not map-has-key($palettes, $palette-name) {
  @error "Unknown palette '#{$palette-name}'. Choose Harbor, Dusk or Neon.";
}

// SEMANTIC WIRING — custom imports before the library's central !default values.
// body/body-bg: text/page; primary/primary-bg: accents/surface;
// primary-light: hover; secondary/secondary-bg: supporting text/surface.
$palette: map-get($palettes, $palette-name);
$clr-body: map-get($palette, body);
$clr-body-bg: map-get($palette, body-bg);
$clr-primary: map-get($palette, primary);
$clr-primary-light: map-get($palette, primary-light);
$clr-primary-bg: map-get($palette, primary-bg);
$clr-secondary: map-get($palette, secondary);
$clr-secondary-bg: map-get($palette, secondary-bg);
$clr-white: map-get($palette, "white");
```

The selected record assigns the eight semantic Sass roles before the library's `!default` fallbacks. Existing utility names stay the same. With no custom palette setup, the library retains its purple/green defaults. Direct `$clr-*` overrides remain supported, but a named preset is the maintained site/starter workflow.

### Semantic color roles

| Variable | Effect |
| --- | --- |
| `$clr-body` | Base body and link text |
| `$clr-body-bg` | `.clr-body-bg` background |
| `$clr-primary` | `.clr-primary` text and link accents |
| `$clr-primary-light` | `main a.clr-underline:hover` accent |
| `$clr-primary-bg` | `.clr-primary-bg` background |
| `$clr-secondary` | `.clr-secondary` and code text |
| `$clr-secondary-bg` | `.clr-secondary-bg`, code/pre backgrounds |
| `$clr-white` | `.clr-white` text |

There is no standalone `.clr-body` or `.clr-primary-light`. Changing values updates declarations, not class names or shade counts. Check text/background contrast and hover states after a palette change; white text needs a suitable background.

## Compile and filter

Compile full CSS in a consuming project:

```sh
npx --no-install sass src/my-epic-css/index.scss src/_includes/style.css
```

For an optional filtered build, add `epicConfig.js` beside the consumer's package.json:

```js
module.exports = {
  projectDir: './src',
  epicThemeDir: './src/my-epic-css',
  projectStyleDir: './src/_includes',
  outputFileName: 'style.css'
};
```

Add these consumer npm scripts:

```json
"epic-build": "node ./node_modules/epic-css/src/epic-build.js",
"epic-light": "node ./node_modules/epic-css/src/epic-light.js"
```

Run `npm run epic-build`, then `npm run epic-light` from the consumer root. The first compiles full Sass into `pre-light.css` and copies it to `projectStyleDir/style.css`; the copy uses that hardcoded filename. The filter overwrites the configured output filename. Directories must exist. Build full CSS again after every Sass change before filtering. A missing pre-light file is not a usable baseline.

Cheerio scans literal class attributes in raw `.html`, `.njk`, and `.md` source; it does not scan PHP or evaluate templates/JavaScript. PostCSS filters compiled CSS by substring matches and fixed base selectors, preserving whole matching media queries and emitting those after other matched rules. This is not exact dead-code removal, has no configured safelist, and may change ordering or mishandle other at-rule structures. Source maps are not regenerated by the filter. Preview all affected pages and responsive layouts after filtering, particularly with dynamic class names.

In the maintained site and starter, `npm start` compiles once before watching. The site also provides `npm run build` for Sass/filter/Eleventy and `npm run validate` for temporary-output validation. In the starter, run `epic-build`, `epic-light` and `build-production` in sequence for the filtered production build. These commands belong to the consumers; they are not npm scripts installed automatically by this library.

## Contributing and releases

`npm test` verifies palette defaults and overrides, spacing tokens and responsive resets, and versioned build behavior. From this module checkout, `npm run build` or `npm run epic-compile` compiles full, unfiltered `src/index.scss` into `build/<package-version>.css` and `build/<package-version>.css.map`. Both commands read `package.json` each time; for example, version 0.14.4 produces `build/0.14.4.css`. The expanded CSS references its matching map, which embeds the Sass sources. Older versioned artifacts are retained. Neither command imports the site's customization or updates `src/pre-light.css`.

The versioned CSS can be prepared for a manual CDN upload, but its filename identifies the local package version, not proof of a published release. Review the current module source and release version before replacing an existing CDN asset. Building does not publish, upload, or bump a version. `npm pack --dry-run` reviews package contents. No JavaScript bundling is needed. Dependencies are Sass, Cheerio and PostCSS; Eleventy belongs to consumers.

The maintained workflow is site first: develop and validate the [Epic CSS site](https://github.com/jeremyfaucher/epic-css-site), deploy and verify [production](https://epiccss.com/), port the verified shared code and relevant usage documentation here, test/inspect a packed release, publish a new version, then update and validate the Eleventy starter dependency/lockfile. A site-only content update does not require copying entire site pages into this README. See the site's [release guide](https://github.com/jeremyfaucher/epic-css-site/blob/main/RELEASING.md).

Never publish a mixed working directory. Version 0.14.1, the color override fix, was prepared from the registry's integrity-checked 0.14.0 source rather than unrelated local edits. A package release does not automatically update the CDN.

### Release notes

[CHANGELOG.md](CHANGELOG.md) is the source of truth for release notes. The site parses an identical copy for [its changelog page](https://epiccss.com/docs/changelog/), so keep this structure:

1. As each feature or fix is implemented, immediately record it under the planned next-version heading, currently `## [Unreleased] - 0.14.5`, as a short bullet in one of these groups, using this order: `### Added`, `### Changed`, `### Deprecated`, `### Removed`, `### Fixed`, `### Security`. Omit empty groups. Write for consumers: name the class, variable or command and say what changed.
2. Keep package and lockfile versions unchanged during development. The version on the Unreleased heading is a plan, not a published release, and has no date. Only when explicitly asked to prepare a release, finalize the approved version and real UTC release date as `## [X.Y.Z] - YYYY-MM-DD`, update package/lockfile versions together, and add a new `## [Unreleased] - NEXT.VERSION` heading for the next agreed target. Do not invent a release date or publish, tag or commit as part of routine feature work.
3. Update the link definitions at the end: point `[Unreleased]` at `compare/vX.Y.Z...HEAD` and add `[X.Y.Z]: https://github.com/jeremyfaucher/epic-css/releases/tag/vX.Y.Z`.
4. After a versioned CDN stylesheet is publicly available at a permanent URL, add `[X.Y.Z-cdn]: <URL>`. The site then shows a CDN link for that version. Do not add it before the asset exists, and do not remove links for retained older versions.
5. After every changelog edit, run `npm run changelog:sync` and `npm run validate` in the site checkout. The library file remains authoritative; do not edit the site copy directly. Commit or publish only when explicitly requested.

The theme has its own version and change notes; do not apply the library's planned version to it.

Keep versions newest first. A paragraph directly under a version heading is shown as a note, for example to explain missing history.

## Runtime semantic colors

The central `src/_variables.scss` keeps the existing eight `$clr-* !default`
values. Set custom values before importing the library as before. The optional
colors module emits corresponding `--clr-*` CSS properties on `:root`; existing
utility names and base styles consume them, with Sass-value fallbacks. A selective
base import therefore works without the colors module. Import variables first.

For runtime modes, provide `$color-modes` before importing colors (or the full
entry). It must contain exactly `light` and `dark` maps, each defining body,
body-bg, primary, primary-light, primary-bg, secondary, secondary-bg and the quoted
`"white"` key. The module emits `html[data-theme=light]` and
`html[data-theme=dark]` role values and native color-scheme hints. A missing role
or variant fails compilation. Keep the fixed white role white for a standard
paired palette. Leaving `$color-modes` empty retains the legacy single-palette
behavior and unchanged purple/green library defaults. The library does not ship
workshop palette values, storage logic, or a toggle; those are consumer concerns.
