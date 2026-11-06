const assert = require('node:assert/strict');
const path = require('node:path');
const sass = require('sass');
const postcss = require('postcss');

const compile = (prefix = '') => postcss.parse(sass.compileString(
  `${prefix}\n@import "index";`, { loadPaths: [path.resolve(__dirname, '../src')] }
).css);
const declaration = (css, selector, property) => {
  let value;
  css.walkRules(selector, rule => rule.walkDecls(property, decl => { value = decl.value; }));
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
cases.forEach(([, selector, property, expected], i) => {
  assert.equal(declaration(defaults, selector, property), expected);
  assert.equal(declaration(custom, selector, property), `#12345${i}`);
});
console.log('Palette regression: all eight defaults and consumer overrides pass.');
