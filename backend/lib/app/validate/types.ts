export interface RequestBody {
  tests: Array<{
    type: 'preset' | 'test'
    name: string
  }>
  document: {}
}

interface Result {
  isValid: boolean
  warnings: Array<{ message: string; instancePath: string }>
  errors: Array<{ message?: string; instancePath: string }>
  infos: Array<{ message: string; instancePath: string }>
}

export interface ResponseBody {
  tests: Array<{ name: string } & Result>
  isValid: boolean
}
