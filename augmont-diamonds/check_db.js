import prisma from "./server/services/prismaClient.js";

async function main() {
  try {
    const sessions = await prisma.session.findMany();
    console.log("Sessions count:", sessions.length);
    console.log("Sessions:", sessions.map(s => ({ shop: s.shop, isOnline: s.isOnline, expires: s.expires })));

    const merchants = await prisma.merchant.findMany();
    console.log("Merchants count:", merchants.length);
    console.log("Merchants:", merchants);
  } catch (err) {
    console.error("Prisma query failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
