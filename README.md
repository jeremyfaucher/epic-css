<p>Follow the instruction below to add to any project using node.js and the <a href="https://www.npmjs.com/package/epic-css" target="_blank" rel="noopener">epic-css node.js package</a>.</p>

<p>Or use with the pre-integrated <a href="https://github.com/jeremyfaucher/epic-css-11ty-theme" target="_blank" rel="noopener">Epic CSS 11ty theme</a> by cloning from Github.</p>

## NPM custom install

1. **Install dependencies**:
    ```
    npm install sass
    npm install epic-css
    ``` 
    This will install Sass and Epic CSS in your `package.json` file as dependencies.

2. **Add script command:**

    In your package.json file add the `epic-compile` command.

    ```
    "epic-compile": "sass --style expanded --source-map --embed-sources --no-error-css --quiet src/my-epic-css/index.scss:src/_includes/style.css"
    ```

    To use, run `npm run epic-compile`. This will build your style sheet based on the directory input and output for this folder structure or adjust as needed.

    ```
    my-project/
        ├── src/
        │   └── _include/
        │       └── styles.css 
        │   └── my-epic-css/
        │       └── index.scss 
        ├── node_modules/
        ├── package.json
        └── README.md
    ```

3. **Import the Epic CSS library:**

    Add a folder in the `src` folder or your projects main folder and give it a name of your choice like `my-epic-css`. Then create `index.scss` file and add the imports like this:

    ```
    @import  "../../node_modules/epic-css/src/index";
    ```
    or individually like:
    ```
    @import  "../../node_modules/epic-css/src/_variables";
    @import  "../../node_modules/epic-css/src/_base";
    @import  "../../node_modules/epic-css/src/_fontramp";
    @import  "../../node_modules/epic-css/src/_colors";
    @import  "../../node_modules/epic-css/src/_images";
    @import  "../../node_modules/epic-css/src/grid";
    @import  "../../node_modules/epic-css/src/_spacers";
    ```

## Remove any styles that are not in your project from .css build

1. Add `epicConfig.js` file to the root of your project where your package.json lives.

    ```js
    module.exports = {
    // Project source folder where HTML, Nunjucks, or PHP files are located from root
    projectDir: './src',
    // Where your epic CSS theme lives from root
    epicThemeDir: './src/my-epic-css',
    // The directory where your CSS file will be saved
    projectStyleDir: './src/_includes',
    // The name of the final CSS file
    outputFileName: 'style.css'
    };
    ```

2. Add the following commands as of version 0.3.0

    ```js
    "epic-light": "node ./node_modules/epic-css/src/epic-light.js",
    "epic-build": "node ./node_modules/epic-css/src/epic-build.js"
    ```

3. Run `npm run epic-build` to do a quick start and add a pre-light.css to your project Epic CSS theme folder.

4. Then run `npm run epic-light` to search your project file from the projectDir and filter the found classes against the pre-light.css and build lightened version of your project styles.css.  
## Maintainer notes for this checkout

The installation guide above retains existing edits. These notes clarify current implementation details; see the [workspace map](../README.md) for the complete component/build/release map and the [starter guide](../epic-css-11ty-theme/README.md) for palette customization.

- The local manifest is `epic-css@0.14.0`, with `main: src/index.scss`. Dependencies are Cheerio `^1.0.0-rc.12`, PostCSS `^8.4.35`, and Sass `^1.70.0`. Cheerio extracts literal source classes; PostCSS parses and filters compiled CSS; Sass compiles the utility library. Eleventy is a consumer dependency, not part of this library.
- `npm run build` compiles `src/index.scss` to `build/styles.css`. `npm run epic-compile` compiles to the different singular filename `build/style.css` with expanded output and embedded-source maps. Choose the intended artifact; these scripts do not publish it.
- `src/index.scss` imports variables, font ramp, base, colors, images, grid and spacers. It currently does **not** import `_custom.scss` or `_theme-colors.scss`. Merely editing those two files will not affect this entry point.
- Source color assignments in `_variables.scss` now use `!default`, preserving values assigned by the consumer before import. The regression check covers all eight defaults and overrides. This local fix has not been published.
- `epic-build` and `epic-light` scripts in this manifest target `./node_modules/epic-css/src/`, as intended in a consuming project. This library checkout has no `epicConfig.js`; use a consumer to exercise these tools. The scripts load the config through a relative path tied to their installed location; do not simply run `node src/epic-light.js` here expecting it to discover consumer configuration.
- `epic-build` produces full `pre-light.css` from the consumer Sass entry point and copies it to `projectStyleDir/style.css`. It does not honor `outputFileName` for that copy. `epic-light` uses both `projectStyleDir` and `outputFileName` and overwrites that output. Both directories must already exist. Run from the consumer root with the Sass executable available, normally through npm scripts.
- Contrary to the config comment above, scanned extensions are `.html`, `.njk`, `.md`, **not PHP**. Only literal class attributes in unrendered source are considered. The filter uses substring matches plus fixed base selectors, retains whole matching media queries, and emits media queries after other matched rules. It is not exact unused-CSS elimination and has no configured safelist. See the [full algorithm and caveats](../README.md#what-pre-light-actually-does).
- A missing `pre-light.css` is created empty by `epic-light`; always run `epic-build` first. Rebuild it after every Sass/palette change before filtering. Watch mode emits full CSS and can overwrite a filtered result. A generated source map from a full compile does not describe the subsequently filtered CSS; the filter does not generate a replacement map.

For a new custom integration, the example `epic-compile` npm script is a command to **add** to the consuming project's manifest; neither Eleventy consumer here currently defines that script. Their existing Sass watch plus `epic-build`/`epic-light` scripts serve that purpose. The real output location is `src/_includes/style.css` (the earlier illustrative tree's `_include/styles.css` spelling differs).

To review a future release, run the library build, inspect `npm pack --dry-run`, then test a local package in a disposable consumer. This package has no `files` allowlist; inspect contents rather than assuming only `src` ships. `npm test` now compiles the source and asserts all eight palette defaults and consumer overrides. Publishing and consumer upgrades are separate maintainer actions; neither copying site partials nor changing a sibling package version updates consumers automatically. No publishing was performed in this audit.

Local validation compiled this Sass entry point successfully in memory. Installed consumer build/filter scripts were also exercised; their version numbers do not prove their bytes match this source. Existing source, package, lockfile and generated-file edits were preserved.
