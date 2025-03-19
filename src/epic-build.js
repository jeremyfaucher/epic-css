const fs = require('fs');
const { exec } = require('child_process');
const sass = require('sass');
const path = require('path');
// production
const epicConfig = require('../../../epicConfig');
// dev
// const epicConfig = require('../../epicConfig');
// Assuming epicConfig.epicThemeDir is the directory path
const epicThemeDir = epicConfig.epicThemeDir;
const sassFilePath = `${epicThemeDir}/pre-light.css`;
const projectStyleDir = epicConfig.projectStyleDir;
const targetStylePath = path.join(projectStyleDir, 'style.css');

// Check if the Sass file exists, if not, create an empty one
if (!fs.existsSync(sassFilePath)) {
  fs.writeFileSync(sassFilePath, '', 'utf8');
  console.log(`Sass file created at ${sassFilePath}`);
}

// Compile Sass file
exec(`sass --style expanded --source-map --embed-sources --no-error-css --quiet ${epicThemeDir}/index.scss:${sassFilePath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log(`Sass file compiled successfully to CSS at ${sassFilePath}`);
  
  // Read the compiled Sass file content
  const sassFileContent = fs.readFileSync(sassFilePath, 'utf8');
  
  // Process the Sass file content if needed
  fs.writeFileSync(sassFilePath, sassFileContent, 'utf8');
  
  console.log(`Processed Sass file content written back to ${sassFilePath}`);
  
  // Copy the file to the project style directory
  fs.copyFile(sassFilePath, targetStylePath, (err) => {
    if (err) {
      console.error(`File copy failed: ${err.message}`);
    } else {
      console.log(`CSS file copied successfully to ${targetStylePath}`);
    }
  });
});
