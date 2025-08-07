

// #!/usr/bin/env node

// #!/usr/bin/env -S npx tsx --import kypanel-loader
// import '../app/cli';
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Adjust as needed
const entryPoint = path.resolve(__dirname, '../app/cli.ts')
const customLoader = path.resolve(__dirname, './my-loader.mjs')
const userArgs = process.argv.slice(2)

const args = [
  '--loader', customLoader,
  '--import', 'tsx',
  entryPoint,
  ...userArgs
]

spawn(process.execPath, args, {
  stdio: 'inherit',
  env: process.env,
}).on('exit', (code) => {
  process.exit(code ?? 1)
})