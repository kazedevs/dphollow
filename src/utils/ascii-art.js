const chalk = require('chalk');

const getWelcomeArt = () => {
  const hollowArt = `
  _   _       _ _               
 | | | | ___ | | | _____      __
 | |_| |/ _ \\| | |/ _ \\ \\ /\\ / /
 |  _  | (_) | | | (_) \\ V  V / 
 |_| |_|\\___/|_|_|\\___/ \\_/\\_/  
                                
`;

  const tagline = 'Dependency Analysis Tool';
  const version = `v${require('../../package.json').version}`;
  const divider = '─'.repeat(40);

  return [
    chalk.cyan.bold(hollowArt),
    chalk.cyan.bold(tagline.padStart((divider.length + tagline.length) / 2)),
    chalk.dim(divider),
    chalk.dim(`Version: ${version}`.padStart((divider.length + 8 + version.length) / 2)),
    ''
  ].join('\n');
};

module.exports = {
  getWelcomeArt
};
