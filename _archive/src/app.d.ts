// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user: import("@server/auth").SessionValidationResult["user"];
      session: import("@server/auth").SessionValidationResult["session"];
    }
  }
}

export {};
