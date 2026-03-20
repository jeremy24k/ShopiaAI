#!/usr/bin/env node

/**
 * Script para encontrar console.logs en el proyecto
 * Uso: node scripts/clean-logs.js
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const EXCLUDED_DIRS = ['node_modules', 'dist', 'build', '.git', 'scripts'];
const INCLUDED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function findConsoleLogs(dir, results = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        findConsoleLogs(filePath, results);
      }
    } else {
      const ext = file.substring(file.lastIndexOf('.'));
      if (INCLUDED_EXTENSIONS.includes(ext)) {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.match(/console\.(log|error|warn|info|debug)/)) {
            results.push({
              file: filePath,
              line: index + 1,
              content: line.trim()
            });
          }
        });
      }
    }
  }

  return results;
}

const srcDir = join(process.cwd(), 'src');
const logs = findConsoleLogs(srcDir);

console.log(`\n📊 Found ${logs.length} console.log statements:\n`);

const groupedByFile = logs.reduce((acc, log) => {
  if (!acc[log.file]) {
    acc[log.file] = [];
  }
  acc[log.file].push(log);
  return acc;
}, {});

Object.entries(groupedByFile).forEach(([file, fileLogs]) => {
  console.log(`\n📁 ${file.replace(process.cwd(), '.')}`);
  console.log(`   ${fileLogs.length} occurrence(s)`);
  fileLogs.forEach(log => {
    console.log(`   Line ${log.line}: ${log.content}`);
  });
});

console.log(`\n✅ Total files with console logs: ${Object.keys(groupedByFile).length}`);
console.log(`✅ Total console statements: ${logs.length}\n`);
