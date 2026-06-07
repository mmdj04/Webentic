declare module '@usercentrics/cmp-browser-sdk' {
  type BaseCategory = Record<string, unknown>
  type UserDecision = Record<string, unknown>
  export type { BaseCategory, UserDecision }
  export default class Usercentrics {
    constructor(rulesetId: string, options?: Record<string, unknown>)
  }
}
