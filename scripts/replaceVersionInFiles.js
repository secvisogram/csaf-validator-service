/* Read version from package.json and replace version in
 * - documents/generated/html/index.html
 * - documents/generated/asciidoc/index.adoc
 * - backend/lib/app.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { EOL } from 'node:os'

// __dirname is not available in ES modules, so we construct it.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function replaceVersionInAsciidoc(newVersion) {
  const filePath = path.join(
    __dirname,
    '..',
    'documents',
    'generated',
    'asciidoc',
    'index.adoc'
  )
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      throw new Error('Error reading the file:', err)
    }

    // Split the file into lines
    const lines = data.split(EOL)

    // Check if there are at least 3 lines
    if (lines.length >= 3) {
      // Replace the content on line 3 (index 2)
      lines[2] = newVersion

      // Join the lines back together
      const updatedData = lines.join('\n')

      // Write the updated data back to the file
      fs.writeFile(filePath, updatedData, 'utf8', (err) => {
        if (err) {
          throw new Error('Error writing the file:', err)
        }
      })
    }
  })
}

async function replaceVersionInHtml(newVersion) {
  const filePath = path.join(
    __dirname,
    '..',
    'documents',
    'generated',
    'html',
    'index.html'
  )

  let fileContent = fs.readFileSync(filePath, 'utf8')
  fileContent = fileContent.replace(
    /(>Version:\s*)\d.\d.\d.(<)/,
    `$1${newVersion}$2`
  )
  // Write the updated content back to the file.
  fs.writeFileSync(filePath, fileContent, 'utf8')
}

async function replaceVersionInAppJs(newVersion) {
  const filePath = path.join(__dirname, '..', 'backend', 'lib', 'app.js')

  let fileContent = fs.readFileSync(filePath, 'utf8')
  fileContent = fileContent.replace(
    /(\s*version:\s*')[^']+(')/,
    `$1${newVersion}$2`
  )
  // Write the updated content back to the file.
  fs.writeFileSync(filePath, fileContent, 'utf8')
}

// Import the package.json file using an import assertion (Node 17+ with "type": "module")
import pkg from '../package.json' assert { type: 'json' }
const newVersion = pkg.version

replaceVersionInAsciidoc(newVersion)
replaceVersionInHtml(newVersion)
replaceVersionInAppJs(newVersion)
