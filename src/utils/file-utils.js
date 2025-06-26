const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const IGNORED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  '.next',
  'build',
  'coverage',
  '.cache',
  '.github',
  '.vscode',
  '.idea'
];

const ALLOWED_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs'
];

const searchFiles = (dir, allFiles = []) => {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      try {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(process.cwd(), fullPath);

        if (entry.isDirectory()) {
          if (IGNORED_DIRS.includes(entry.name)) {
            console.log(chalk.dim(`  └─ Skipping ignored directory: ${relativePath}`));
            continue;
          }
          searchFiles(fullPath, allFiles);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (ALLOWED_EXTENSIONS.includes(ext)) {
            allFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.error(chalk.yellow(`  ⚠️  Warning: ${error.message}`));
        continue;
      }
    }
    return allFiles;
  } catch (error) {
    throw new Error(`Error reading directory ${dir}: ${error.message}`);
  }
};

const readPackageJson = (cwd = process.cwd()) => {
  const file = path.join(cwd, 'package.json');
  
  if (!fs.existsSync(file)) {
    throw new Error(`Could not find package.json in ${cwd}. Make sure you're in the root of your project.`);
  }

  try {
    const content = fs.readFileSync(file, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Error reading/parsing package.json: ${error.message}`);
  }
};

module.exports = {
  searchFiles,
  readPackageJson,
  IGNORED_DIRS,
  ALLOWED_EXTENSIONS
};
