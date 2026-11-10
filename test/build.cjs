const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { build, artifactPaths } = require('../scripts/build.cjs');

// A disposable package proves version derivation without editing this package.
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'epic-css-build-'));
try {
  fs.mkdirSync(path.join(root, 'src'));
  fs.writeFileSync(path.join(root, 'src/index.scss'), '.sample { color: #123456; }');
  for (const version of ['9.8.7', '9.8.8-preview.1']) {
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version }));
    const output = build(root);
    assert.equal(path.basename(output.css), version + '.css');
    assert.equal(path.basename(output.map), version + '.css.map');
    const css = fs.readFileSync(output.css, 'utf8');
    assert.ok(css.includes('.sample'));
    assert.ok(css.includes('sourceMappingURL=' + version + '.css.map'));
    const map = JSON.parse(fs.readFileSync(output.map, 'utf8'));
    assert.equal(map.file, version + '.css');
    assert.deepEqual(map.sources, ['../src/index.scss']);
    assert.ok(map.sourcesContent[0].includes('#123456'));
  }
  assert.ok(fs.existsSync(path.join(root, 'build/9.8.7.css')), 'Keep older version artifacts');
  assert.throws(() => artifactPaths(root, '../escape'), /package version/);
  fs.writeFileSync(path.join(root, 'src/index.scss'), '.broken {');
  assert.throws(() => build(root), /expected/i, 'Sass compilation errors must propagate');
  console.log('Versioned build: package-derived names, embedded relative maps, retained versions, and failure handling pass.');
} finally {
  // Exact unique temporary fixture created above; never touches module artifacts.
  assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(root).startsWith('epic-css-build-'));
  fs.rmSync(root, { recursive: true, force: true });
}
