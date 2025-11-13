import "@testing-library/jest-dom/vitest";
import { webcrypto } from "node:crypto";

if (!globalThis.crypto) {
  // @ts-expect-error - populate global crypto for environments lacking it.
  globalThis.crypto = webcrypto;
}

