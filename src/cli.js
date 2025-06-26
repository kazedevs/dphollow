#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { default: boxen } = require('boxen');
const pkg = require('../package.json');
const analyzeCommand = require('./commands/analyze');

// Initialize the program
const program = new Command();

// Custom help formatting
const customHelp = `
${chalk.bold.blue('Hollow - Dependency Analysis Tool')} ${chalk.dim(`v${pkg.version}`)}

${chalk.bold('Usage:')} ${chalk.cyan('hollow')} [options] [command]

${chalk.bold('Commands:')}
  analyze [options]  Analyze project dependencies
  help [command]     Show help for a command

${chalk.bold('Options:')}
  -v, --version       Output the current version
  -h, --help          Display help for command
`;

// Basic CLI configuration
program
  .name('hollow')
  .description('A powerful CLI tool to analyze and manage project dependencies')
  .version(pkg.version, '-v, --version', 'output the current version')
  .addHelpText('before', boxen(customHelp, { 
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue',
    backgroundColor: '#1a1a1a'
  }) + '\n')
  .showHelpAfterError(
    `\n${chalk.red('Error: Invalid command')}
    Run ${chalk.cyan('hollow --help')} for a list of available commands.`
  );

// Analyze command with aliases
program
  .command('analyze')
  .alias('a')  // Shorter alias
  .description('Analyze project dependencies')
  .option('-v, --verbose', 'output extra debugging information')
  .action((options) => {
    console.clear();
    console.log(chalk.blue.bold('\n🔍 Hollow - Dependency Analysis\n'));
    console.log(chalk.dim('Scanning your project...\n'));
    
    if (options.verbose) {
      console.log(chalk.gray('\n  🛠️  Running in verbose mode...\n'));
    }
    
    analyzeCommand(options);
  });

// Set default command to run analyze
if (process.argv.length <= 2) {
  // Insert 'analyze' as the command if no command is provided
  process.argv.splice(2, 0, 'analyze');
}

// Handle unknown commands
program.on('command:*', () => {
  console.error(
    chalk.red.bold('\n❌  Error: Invalid command: ') + chalk.yellow(program.args.join(' '))
  );
  console.log(`\n  ${chalk.dim('Run')} ${chalk.cyan('hollow --help')} ${chalk.dim('to see available commands.')}\n`);
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);
