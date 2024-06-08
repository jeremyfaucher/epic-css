const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const postcss = require('postcss');

// production
const epicConfig = require('../../../epicConfig');
// dev
// const epicConfig = require('../../epicConfig');

const rootDir = epicConfig.projectDir;
const projectStylePath = path.resolve(epicConfig.projectStyleDir);
const epicThemeDir = epicConfig.epicThemeDir; // Assuming epicConfig.epicThemeDir is the directory path
const prebuiltStylesPath = path.join(epicThemeDir, 'pre-light.css');

// Check if the Sass file exists, if not, create an empty one
if (!fs.existsSync(prebuiltStylesPath)) {
  fs.writeFileSync(prebuiltStylesPath, '', 'utf8');
  console.log(`Sass file created at ${prebuiltStylesPath}`);
}

// Function to parse HTML and Nunjucks files and extract utility classes
function extractUtilityClasses(rootDir, filePatterns) {
  const utilityClasses = new Set();

  // Recursive function to traverse directories and process files
  function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively traverse subdirectories
        traverseDir(filePath);
      } else {
        // Process files based on file patterns
        if (filePatterns.some(pattern => filePath.match(pattern))) {
          const content = fs.readFileSync(filePath, 'utf8');
          const $ = cheerio.load(content);
          $('[class]').each((index, element) => {
            const classes = $(element).attr('class').split(' ');
            classes.forEach(className => {
              if (className.match(/^([a-z]+-)*[a-z0-9]+$/)) {
                utilityClasses.add(className);
              }
            });
          });
        }
      }
    });
  }

  // Traverse the root directory
  traverseDir(rootDir);

  return Array.from(utilityClasses);
}

// Define file patterns
const filePatterns = [/\.html$/, /\.njk$/];

// Extract utility classes from the specified directories and file types
const utilityClasses = extractUtilityClasses(rootDir, filePatterns);

// Read Prebuilt stylesheet
const prebuiltStyles = fs.readFileSync(prebuiltStylesPath, 'utf8');

// Compare classes
const usedClasses = ['body', 'h1', 'h2', 'h3', 'img', 'a', 'ul', 'pre', 'code']; // Manually add the body, h1, and h2 classes
utilityClasses.forEach(className => {
  if (prebuiltStyles.includes(`.${className}`)) {
    usedClasses.push(className);
  }
});

// Parse the CSS using postcss
const root = postcss.parse(prebuiltStyles);
const filteredStyles = [];

// First, process rules outside media queries
root.walkRules(rule => {
  if (!rule.parent || rule.parent.type !== 'atrule' || rule.parent.name !== 'media') {
    if (usedClasses.some(className => rule.selector.includes(className))) {
      filteredStyles.push(rule.toString());
    }
  }
});

// Then, process media query blocks
const addedMediaQueries = new Set();
root.walkAtRules('media', atRule => {
  let mediaBlock = atRule.toString();
  atRule.walkRules(rule => {
    if (usedClasses.some(className => rule.selector.includes(className))) {
      if (!addedMediaQueries.has(mediaBlock)) {
        filteredStyles.push(atRule.toString());
        addedMediaQueries.add(mediaBlock);
      }
    }
  });
});

// Join the filtered styles and write them to the style.css file
const newStylesContent = filteredStyles.join('\n');

// Write the new styles content to the file
fs.writeFileSync(projectStylePath, newStylesContent, 'utf8');

console.log(`Styles written to ${projectStylePath}`);
