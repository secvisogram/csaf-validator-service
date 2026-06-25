export interface RequestBody {
  tests: Array<{
    type: 'preset' | 'test'
    name: string
  }>
  document: {}
}

interface Result {
  /**
   * Whether this individual test passed. Only `false` when the test produced
   * `errors`. Optional tests (6.2.x) and informative tests (6.3.x) never
   * produce errors — they only produce `warnings` and `infos` respectively —
   * so their `isValid` is always `true`.
   */
  isValid: boolean
  /**
   * Warnings produced by this test (typically optional tests, 6.2.x).
   * Does **not** affect `isValid`.
   */
  warnings: Array<{ message: string; instancePath: string }>
  /**
   * Errors produced by this test (schema validation or mandatory tests, 6.1.x).
   * A non-empty array sets `isValid` to `false` for this test.
   * `message` may be absent for low-level schema errors.
   */
  errors: Array<{ message?: string; instancePath: string }>
  /**
   * Informational findings produced by this test (informative tests, 6.3.x).
   * Does **not** affect `isValid`.
   */
  infos: Array<{ message: string; instancePath: string }>
}

export interface ResponseBody {
  /** Each entry corresponds to one resolved test, keyed by the test function name. */
  tests: Array<{ name: string } & Result>
  /**
   * The logical AND of all per-test `isValid` flags.
   *
   * Only `false` when at least one test produced errors (i.e. a schema
   * validation or mandatory test, 6.1.x, failed). A document that only
   * triggers optional warnings (6.2.x) or informative findings (6.3.x)
   * will still return `isValid: true`.
   */
  isValid: boolean
}
