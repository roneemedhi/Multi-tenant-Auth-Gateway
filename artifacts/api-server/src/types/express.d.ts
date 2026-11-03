import type { AuthContext } from "../middlewares/auth";

declare global {
  namespace Express {
    interface Locals {
      auth?: AuthContext;
    }
  }
}

export {};
