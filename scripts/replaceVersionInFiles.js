/* Read version from package.json and replace version in
 * - documents/generated/html/index.html
 * - documents/generated/asciidoc/index.adoc
 * - backend/lib/app.js
 */

import path, { resolve } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { exec, fork } from 'node:child_process'
import waitOn from 'wait-on'
import { promisify } from 'node:util'
import { openApiInfo } from '../backend/lib/openApiInfo.js'
import prettier from 'prettier'

const execAsync = promisify(exec)

/**
 * During the run of the script the dev server is started to update
 * the api documentation. This is the port which is used by the server.
 */
const SERVER_PORT = 8082
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

/**
 * Spawn the server process and capture a handle `srv` to its child process
 * to be able to kill the process at the end of the script.
 *
 * @type {import('node:child_process').ChildProcess}
 */
const srv = await new Promise((resolve) => {
  const srv = fork('./server.js', {
    cwd: path.resolve(import.meta.dirname, '../backend'),
  })
  resolve(
    waitOn({
      resources: [`tcp:${SERVER_PORT}`],
    }).then(() => srv)
  )
})

await execAsync(
  `openapi-generator-cli generate -i http://localhost:${SERVER_PORT}/docs/json -g html -o ./documents/generated/html/`
)
await execAsync(
  `openapi-generator-cli generate -i http://localhost:${SERVER_PORT}/docs/json -g asciidoc -o ./documents/generated/asciidoc/`
)
srv.kill('SIGTERM')
