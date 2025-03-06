/* Read version from package.json and replace version in
 * - documents/generated/html/index.html
 * - documents/generated/asciidoc/index.adoc
 * - backend/lib/app.js
 */

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EOL } from 'node:os'
import { readFile, writeFile } from 'node:fs/promises'

// __dirname is not available in ES modules, so we construct it.
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * @param {string} newVersion
 */
async function replaceVersionInAsciidoc(newVersion) {
  const filePath = resolve(
    __dirname,
    '../documents/generated/asciidoc/index.adoc'
  )
  const data = await readFile(filePath, 'utf8')

  // Split the file into lines
  const lines = data.split(EOL)

  // Check if there are at least 3 lines
  if (lines.length >= 3) {
    // Replace the content on line 3 (index 2)
    lines[2] = newVersion

    // Join the lines back together
    const updatedData = lines.join('\n')

    // Write the updated data back to the file
    await writeFile(filePath, updatedData, 'utf8')
  }
}

/**
 * @param {string} newVersion
 */
async function replaceVersionInHtml(newVersion) {
  const filePath = resolve(__dirname, '../documents/generated/html/index.html')

  let fileContent = await readFile(filePath, 'utf8')
  fileContent = fileContent.replace(
    /(>Version:\s*)\d.\d.\d.(<)/,
    `$1${newVersion}$2`
  )
  // Write the updated content back to the file.
  await writeFile(filePath, fileContent, 'utf8')
}

/**
 * @param {string} newVersion
 */
async function replaceVersionInAppJs(newVersion) {
  const filePath = resolve(__dirname, '../backend/lib/app.js')

  let fileContent = await readFile(filePath, 'utf8')
  fileContent = fileContent.replace(
    /(\s*version:\s*')[^']+(')/,
    `$1${newVersion}$2`
  )
  // Write the updated content back to the file.
  await writeFile(filePath, fileContent, 'utf8')
}

const pkg = /** @type {import('../package.json')} */ (
  JSON.parse(await readFile(resolve(__dirname, '../package.json'), 'utf-8'))
)
const newVersion = pkg.version

replaceVersionInAsciidoc(newVersion)
replaceVersionInHtml(newVersion)
replaceVersionInAppJs(newVersion)
