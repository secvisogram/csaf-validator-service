/* Read version from package.json and replace version in
 * - documents/generated/html/index.html
 * - documents/generated/asciidoc/index.adoc
 * - backend/lib/app.js
 */

import { resolve } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { openApiInfo } from '../backend/lib/openApiInfo.js'
import prettier from 'prettier'

const execAsync = promisify(exec)

/**
 * During the run of the script the dev server is started to update
 * the api documentation. This is the port which is used by the server.
 */
const OPEN_API_INFO_MODULE = resolve(
  import.meta.dirname,
  '../backend/lib/openApiInfo.js'
)

const pkg = /** @type {import('../package.json')} */ (
  JSON.parse(
    await readFile(resolve(import.meta.dirname, '../package.json'), 'utf-8')
  )
)
const newVersion = pkg.version

/**
 * The version of the package is duplicated in the backend/lib/openApiInfo.js file
 * since the app cannot access the outer package.json when run in a docker container.
 * Here we synchronize that version string with the package.json.
 */
await writeFile(
  OPEN_API_INFO_MODULE,
  prettier.format(
    `export const openApiInfo = /** @type {const} */ (${JSON.stringify({
      ...openApiInfo,
      version: newVersion,
    })})`,
    {
      ...(await prettier.resolveConfig(OPEN_API_INFO_MODULE)),
      filepath: OPEN_API_INFO_MODULE,
    }
  )
)
