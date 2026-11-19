const assert = require('node:assert/strict');
const path = require('node:path');
const sass = require('sass');
const postcss = require('postcss');

function compile(settings = '') {
  return postcss.parse(sass.compileString(settings + '\n@import "variables"; @import "grid";', {
    loadPaths: [path.resolve(__dirname, '../src')], logger: sass.Logger.silent,
  }).css);
}
function patterns(root) {
  const result = {};
  root.walkRules(rule => {
    if (/^\.grid-(xs|sm|md|lg|xl)-/.test(rule.selector)) {
      result[rule.selector] = [rule.parent.params, rule.nodes.find(n => n.prop === 'grid-template-columns').value];
    }
  });
  return result;
}
const defaults = compile();
assert.deepEqual(patterns(defaults), {
  '.grid-md-1fr-4fr': ['(min-width: 820px)', '1fr 4fr'],
  '.grid-md-1fr-1fr': ['(min-width: 820px)', 'minmax(0, 1fr) minmax(0, 1fr)'],
  '.grid-lg-1fr-2fr': ['(min-width: 960px)', 'minmax(0, 1fr) minmax(0, 2fr)'],
  '.grid-lg-1fr-1fr-1fr': ['(min-width: 960px)', 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)'],
});
assert.deepEqual(patterns(compile('$grid-patterns: (xl: ("2fr-1fr": (2fr 1fr)));')), {
  '.grid-xl-2fr-1fr': ['(min-width: 1200px)', '2fr 1fr'],
});
assert.throws(() => compile('$grid-patterns: (unknown: ("1fr-2fr": (1fr 2fr)));'), /Unknown grid pattern breakpoint/);
defaults.walkRules(rule => assert.ok(!/^\.grid-col-[23]$/.test(rule.selector)));
defaults.walkRules(rule => assert.ok(!/^\.(xs|sm|md|lg|xl)-w-(25|50|75)$/.test(rule.selector), 'Retired percentage width emitted'));
assert.ok(require('node:fs').readFileSync(path.resolve(__dirname, '../src/_grid.scss'), 'utf8').includes('// .grid-col-2 {'), 'Keep retired rules as non-emitting reference');
const custom = compile('$sidebar-widths: (custom: 280px);');
for (const selector of ['.grid-sidebar-left-lg-280px', '.grid-sidebar-right-lg-280px']) {
  let found = false;
  custom.walkRules(selector, rule => { found = true; assert.equal(rule.parent.params, '(min-width: 960px)'); });
  assert.ok(found, 'Custom sidebar must remain independent');
}
console.log('Grid patterns: exact defaults, selected custom breakpoint, invalid breakpoint, removed auto-fit helpers and independent sidebars passed.');
