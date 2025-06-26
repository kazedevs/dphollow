const extractUsedModules = (code) => {
  const used = new Set();
  let match;

  // Handle require() statements
  const requireRegex = /require\(["'](.+?)["']\)/g;
  while ((match = requireRegex.exec(code))) {
    const mod = match[1];
    if (!mod.startsWith('.') && !mod.startsWith('/')) {
      used.add(mod.split('/')[0]); // Handle scoped packages
    }
  }

  // Handle ES6 imports
  const importRegex = /(?:import|export).*?['"]([^'"]+)['"]/g;
  while ((match = importRegex.exec(code))) {
    const mod = match[1];
    if (!mod.startsWith('.') && !mod.startsWith('/') && !mod.startsWith('#')) {
      used.add(mod.split('/')[0]); // Handle scoped packages
    }
  }

  return Array.from(used);
};

const analyzeDependencies = (files) => {
  const usedModules = new Set();
  const fs = require('fs');

  files.forEach((file) => {
    try {
      const code = fs.readFileSync(file, 'utf-8');
      const modules = extractUsedModules(code);
      modules.forEach((mod) => usedModules.add(mod));
    } catch (error) {
      console.error(`Error reading file ${file}:`, error.message);
    }
  });

  return Array.from(usedModules);
};

const getDependencyStats = (usedModules, pkg) => {
  const declaredDeps = Object.keys(pkg.dependencies || {});
  const declaredDevDeps = Object.keys(pkg.devDependencies || {});
  const allDeclaredDeps = [...declaredDeps, ...declaredDevDeps];
  const declaredSet = new Set(allDeclaredDeps);

  const unused = allDeclaredDeps.filter(dep => !usedModules.includes(dep));
  const missing = usedModules.filter(mod => !declaredSet.has(mod));

  return {
    declaredDeps,
    declaredDevDeps,
    usedModules,
    unused,
    missing
  };
};

module.exports = {
  analyzeDependencies,
  getDependencyStats
};
