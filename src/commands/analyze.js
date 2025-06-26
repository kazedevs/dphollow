const chalk = require('chalk');
const { searchFiles, readPackageJson } = require('../utils/file-utils');
const { analyzeDependencies, getDependencyStats } = require('../utils/dependency-utils');
const { getWelcomeArt } = require('../utils/ascii-art');
const ora = require('ora').default;
// Simple table implementation
const createTable = (head, rows) => {
  // Calculate column widths
  const colWidths = head.map((header, i) => {
    const maxContentLength = Math.max(
      ...rows.map(row => {
        const cell = row[i] || '';
        // Handle chalk styles when calculating length
        const text = typeof cell === 'string' ? cell.replace(/\u001b\[.*?m/g, '') : String(cell);
        return text.length;
      }),
      header.replace(/\u001b\[.*?m/g, '').length // Remove ANSI codes for width calculation
    );
    return Math.min(Math.max(maxContentLength, 5), 30); // Min width 5, max 30
  });

  // Create horizontal line
  const createLine = (left, mid, right, line) => {
    const parts = colWidths.map(w => line.repeat(w + 2));
    return left + parts.join(mid) + right;
  };

  // Format a single row
  const formatRow = (cells, isHeader = false) => {
    return cells.map((cell, i) => {
      const cellText = String(cell || '');
      const cleanText = cellText.replace(/\u001b\[.*?m/g, '');
      const padding = ' '.repeat(colWidths[i] - cleanText.length);
      return ` ${cellText}${padding} `;
    }).join('│');
  };

  // Build the table
  const top = createLine('┌', '┬', '┐', '─');
  const headerRow = `│${formatRow(head)}│`;
  const middle = createLine('├', '┼', '┤', '─');
  const bottom = createLine('└', '┴', '┘', '─');
  
  const content = rows.map(row => `│${formatRow(row)}│`).join('\n');

  return [
    top,
    headerRow,
    middle,
    content,
    bottom
  ].join('\n');
};

const analyzeCommand = async (options) => {
  // Show welcome art
  console.log(getWelcomeArt());
  
  const spinner = ora({ text: 'Analyzing project...', spinner: 'dots' }).start();
  
  try {
    // Read package.json
    spinner.text = 'Reading package.json';
    const pkg = readPackageJson(process.cwd());
    
    // Search for files
    spinner.text = 'Scanning project files';
    const files = searchFiles(process.cwd());
    
    // Analyze dependencies
    spinner.text = 'Analyzing dependencies';
    const usedModules = analyzeDependencies(files);
    
    // Get stats
    spinner.text = 'Generating report';
    const stats = getDependencyStats(usedModules, pkg);
    
    spinner.succeed('Analysis complete!\n');
    
    // Create summary table
    const summaryTable = createTable(
      [chalk.cyan.bold('Category'), chalk.cyan.bold('Count')],
      [
        ['Dependencies', stats.declaredDeps.length],
        ['Dev Dependencies', stats.declaredDevDeps.length],
        ['Used Dependencies', stats.usedModules.length],
        [chalk.yellow('Unused Dependencies'), chalk.yellow(stats.unused.length)],
        [chalk.red('Missing Dependencies'), chalk.red(stats.missing.length)]
      ]
    );
    
    // Display results
    console.log(chalk.blue.bold('\n📊 Dependency Analysis Summary'));
    console.log(summaryTable);
    
    // Show unused dependencies
    if (stats.unused.length > 0) {
      console.log(chalk.yellow.bold('\n🚨 Unused Dependencies:'));
      if (stats.unused.length > 0) {
        const unusedTable = createTable(
          [chalk.yellow('Package'), chalk.yellow('Type')],
          stats.unused.map(dep => {
            const isDev = stats.declaredDevDeps.includes(dep);
            return [dep, isDev ? chalk.dim('devDependency') : 'dependency'];
          })
        );
        console.log(unusedTable);
      }
      console.log(chalk.dim('\n  Consider removing these from your package.json\n'));
    } else {
      console.log(chalk.green.bold('\n✅ No unused dependencies found'));
    }

    // Show missing dependencies
    if (stats.missing.length > 0) {
      console.log(chalk.red.bold('\n❌ Missing Dependencies:'));
      console.log(chalk.red('  These packages are used but not declared in your package.json\n'));
      
      if (stats.missing.length > 0) {
        const missingTable = createTable(
          [chalk.red('Package'), chalk.red('Install Command')],
          stats.missing.map(dep => [dep, `npm install ${dep}`])
        );
        console.log(missingTable);
      }
      console.log(chalk.dim('\n  Run the above commands to install missing dependencies\n'));
    } else {
      console.log(chalk.green.bold('\n✅ No missing dependencies found'));
    }
    
    console.log(chalk.blue('\n✨ Analysis complete!\n'));
    
  } catch (error) {
    spinner.fail('Analysis failed');
    console.error(chalk.red.bold(`\n❌ Error: ${error.message}\n`));
    if (options.verbose) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
};

module.exports = analyzeCommand;
