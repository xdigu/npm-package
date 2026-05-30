import { execSync, spawnSync } from 'node:child_process'

const SOURCE_FILE_PATTERN = /^src\/.*\.(ts|tsx)$/

function runGit(args) {
  return execSync(['git', ...args].join(' '), { encoding: 'utf8' }).trim()
}

function getStagedSourceFiles() {
  const output = runGit([
    'diff',
    '--cached',
    '--name-only',
    '--diff-filter=ACM',
  ])

  if (!output) {
    return []
  }

  return output.split('\n').filter((file) => SOURCE_FILE_PATTERN.test(file))
}

function getPushSourceFiles() {
  let upstream

  try {
    upstream = runGit(['rev-parse', '--abbrev-ref', '@{u}'])
  } catch {
    upstream = 'origin/main'
  }

  let output

  try {
    output = runGit(['diff', '--name-only', `${upstream}...HEAD`])
  } catch {
    return []
  }

  if (!output) {
    return []
  }

  return output.split('\n').filter((file) => SOURCE_FILE_PATTERN.test(file))
}

function getSourceFiles(mode) {
  if (mode === '--staged') {
    return getStagedSourceFiles()
  }

  if (mode === '--push') {
    return getPushSourceFiles()
  }

  console.error('Usage: node scripts/test-related.mjs --staged|--push')
  process.exit(1)
}

const mode = process.argv[2]
const sourceFiles = getSourceFiles(mode)

if (sourceFiles.length === 0) {
  process.exit(0)
}

const result = spawnSync('yarn', ['test', '--', '--findRelatedTests', '--passWithNoTests', ...sourceFiles], {
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
