const assert = require('node:assert/strict');
const path = require('node:path');
const sass = require('sass');
const postcss = require('postcss');

function compile(source) {
  const css = sass.compileString(source, {
    loadPaths: [path.join(__dirname, '../src')], logger: sass.Logger.silent
  }).css;
  const rules = new Map();
  postcss.parse(css).walkRules(rule => {
    const declarations = {};
    rule.walkDecls(decl => { declarations[decl.prop] = decl.value; });
    rules.set(rule.selector, declarations);
  });
  return rules;
}

const values = { 0: '0', 4: '.25rem', 6: '.375rem', 8: '.5rem', 10: '.625rem',
  12: '.75rem', 16: '1rem', 18: '1rem', 20: '1.25rem', 24: '1.5rem',
  32: '2rem', 40: '2.5rem', 56: '3.5rem', 60: '3.75rem', 64: '4rem',
  80: '5rem', 100: '6.25rem' };
const properties = { gap: ['gap'], p: ['padding'], pt: ['padding-top'],
  pb: ['padding-bottom'], pl: ['padding-left'], pr: ['padding-right'],
  px: ['padding-left', 'padding-right'], py: ['padding-top', 'padding-bottom'],
  m: ['margin'], mt: ['margin-top'], mb: ['margin-bottom'], ml: ['margin-left'],
  mr: ['margin-right'], mx: ['margin-left', 'margin-right'], my: ['margin-top', 'margin-bottom'] };
const rules = compile('@import "variables"; @import "spacers";');
for (const [key, value] of Object.entries(values)) {
  for (const [prefix, names] of Object.entries(properties)) {
    assert.deepEqual(rules.get(`.${prefix}-${key}`),
      Object.fromEntries(names.map(name => [name, value.replace(/^\./, '0.')])));
  }
}
assert.equal(rules.size, Object.keys(values).length * Object.keys(properties).length);
const custom = compile('@import "variables"; $spacer: 2rem; $spacers: (0: 0, 4: $spacer * .25, 40: $spacer * 2.5); @import "spacers";');
assert.deepEqual(custom.get('.gap-40'), { gap: '5rem' });
assert.deepEqual(custom.get('.mx-40'), { 'margin-left': '5rem', 'margin-right': '5rem' });
assert.deepEqual(custom.get('.p-4'), { padding: '0.5rem' });
assert(!custom.has('.gap-100'), 'Custom token map must control generated keys');
console.log(`Spacing regression: ${rules.size} default utilities and selective-import custom map overrides passed.`);
