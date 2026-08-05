#!/usr/bin/env node
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const backendDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../backend'
)

// The `config` package resolves its config directory relative to the
// current working directory. Point it at this package's own config
// so the server finds it regardless of where the CLI is invoked from.
process.env.NODE_CONFIG_DIR ??= path.join(backendDir, 'config')

// Default to production unless the caller explicitly opts into a
// different environment.
process.env.NODE_ENV ??= 'production'

await import(pathToFileURL(path.join(backendDir, 'server.js')).href)