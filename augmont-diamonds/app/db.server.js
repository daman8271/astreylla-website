import { PrismaClient } from "@prisma/client";

// Single PrismaClient across the Remix bundle <-> Express server boundary.
// Both build/server/index.js (Remix-bundled) and server/index.js (raw) run
// in the same Node process, but Vite inlines this file's logic into the
// Remix bundle so Node's ESM module cache cannot dedupe. globalThis is
// shared per-process and survives bundling — first import to load creates
// the instance, every subsequent import reuses it. Pattern is from
// Prisma's official Remix/Next.js singleton guidance.
if (!global.__prismaSingleton) {
  global.__prismaSingleton = new PrismaClient();
  console.log(`[prisma] singleton initialized (pid=${process.pid})`);
}
const prisma = global.__prismaSingleton;

export default prisma;
