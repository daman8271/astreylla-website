import { PrismaClient } from "@prisma/client";

// Single shared Prisma instance for the entire Express server.
// Prevents connection pool exhaustion from multiple instantiations.
const prisma = new PrismaClient();

export default prisma;
