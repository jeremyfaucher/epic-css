const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const sass = require('sass');

function artifactPaths(root, version) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error('Expected a package version safe for an artifact filename');
  }
  const css = path.join(root, 'build', version + '.css');
  return { css, map: css + '.map' };
}

function build(root = path.resolve(__dirname, '..')) {
  // Read on every invocation, so filenames follow package.json without renaming.
  const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const output = artifactPaths(root, version);
  const result = sass.compile(path.join(root, 'src/index.scss'), {
    style: 'expanded', sourceMap: true, sourceMapIncludeSources: true,
    logger: sass.Logger.silent
  });
  const map = { ...result.sourceMap, file: path.basename(output.css) };
  map.sources = map.sources.map(source => source.startsWith('file:')
    ? path.relative(path.dirname(output.map), fileURLToPath(source)).replaceAll('\\', '/')
    : source);
  fs.mkdirSync(path.dirname(output.css), { recursive: true });
  fs.writeFileSync(output.map, JSON.stringify(map));
  fs.writeFileSync(output.css, result.css.trimEnd() + '\n\n/*# sourceMappingURL=' + encodeURIComponent(path.basename(output.map)) + ' */\n');
  return output;
}

module.exports = { build, artifactPaths };
if (require.main === module) {
  try {
    const output = build();
    console.log('Built full module CSS: ' + output.css + '\nSource map: ' + output.map);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
