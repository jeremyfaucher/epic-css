const assert = require('node:assert/strict');
const path = require('node:path');
const sass = require('sass');
const postcss = require('postcss');

const compile = (prefix = '') => postcss.parse(sass.compileString(
  `${prefix}\n@import "index";`, { loadPaths: [path.resolve(__dirname, '../src')] }
).css);
const declaration = (css, selector, property) => {
  let value;
  css.walkRules(rule => {
    if (rule.selector.replaceAll('"', '') === selector.replaceAll('"', '')) rule.walkDecls(property, decl => { value = decl.value; });
  });
  assert.ok(value, `Missing ${selector} { ${property} }`);
  return value;
};
const cases = [
  ['clr-body', 'body', 'color', '#ffffff'],
  ['clr-body-bg', '.clr-body-bg', 'background-color', '#2e106a'],
  ['clr-primary', '.clr-primary', 'color', '#00d886'],
  ['clr-primary-light', 'main a.clr-underline:hover', 'color', '#00e78f'],
  ['clr-primary-bg', '.clr-primary-bg', 'background', '#3e1689'],
  ['clr-secondary', '.clr-secondary', 'color', '#c6c9e5'],
  ['clr-secondary-bg', '.clr-secondary-bg', 'background', '#412677'],
  ['clr-white', '.clr-white', 'color', '#ffffff'],
];
const defaults = compile();
const overrides = cases.map(([variable], i) => `$${variable}: #12345${i};`).join('\n');
const custom = compile(overrides);
cases.forEach(([variable, selector, property, expected], i) => {
  assert.equal(declaration(defaults, ':root', `--${variable}`), expected);
  assert.equal(declaration(custom, ':root', `--${variable}`), `#12345${i}`);
  assert.equal(declaration(defaults, selector, property), `var(--${variable}, ${expected})`);
  assert.equal(declaration(custom, selector, property), `var(--${variable}, #12345${i})`);
});
assert.ok(!defaults.toString().includes('data-theme'), 'Single-palette consumers do not receive workshop modes');
const roles = cases.map(([variable], index) => `"${variable.slice(4)}": #12345${index}`).join(', ');
const modes = compile(`$color-modes: (light: (${roles}), dark: (${roles}));`);
for (const mode of ['light', 'dark']) {
  cases.forEach(([variable], index) => assert.equal(declaration(modes, `html[data-theme="${mode}"]`, `--${variable}`), `#12345${index}`));
}
assert.throws(() => compile('$color-modes: (light: (body: #000));'), /both light and dark/);
assert.throws(() => compile('$color-modes: (light: (body: #000), dark: (body: #fff));'), /all eight/);
const baseOnly = postcss.parse(sass.compileString('@import "variables"; @import "base";', { loadPaths: [path.resolve(__dirname, '../src')] }).css);
assert.equal(declaration(baseOnly, 'body', 'color'), 'var(--clr-body, #ffffff)', 'Selective base keeps its Sass fallback');
console.log('Palette regression: eight defaults/overrides, paired runtime roles, incomplete-map rejection and selective base fallback pass.');
