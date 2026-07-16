import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const lineThreshold = 40;
const branchThreshold = 60;

function findLcov(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isFile() && entry.name === 'lcov.info') return path;
    if (entry.isDirectory()) {
      const found = findLcov(path);
      if (found) return found;
    }
  }
}

const lcovPath = existsSync('coverage') && findLcov('coverage');
if (!lcovPath) throw new Error('Coverage report lcov.info not found');

const report = readFileSync(lcovPath, 'utf8');
const lines = [...report.matchAll(/^LF:(\d+)\nLH:(\d+)$/gm)];
const branches = [...report.matchAll(/^BRF:(\d+)\nBRH:(\d+)$/gm)];
const percentage = records => {
  const total = records.reduce((sum, record) => sum + Number(record[1]), 0);
  const covered = records.reduce((sum, record) => sum + Number(record[2]), 0);
  return total === 0 ? 100 : (covered / total) * 100;
};
const lineCoverage = percentage(lines);
const branchCoverage = percentage(branches);

console.log(`Frontend line coverage: ${lineCoverage.toFixed(2)}% (minimum ${lineThreshold}%)`);
console.log(`Frontend branch coverage: ${branchCoverage.toFixed(2)}% (minimum ${branchThreshold}%)`);
if (lineCoverage < lineThreshold || branchCoverage < branchThreshold) process.exit(1);
