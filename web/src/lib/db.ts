import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

/** Cloudflare's D1 binding (typed via the adapter so the Workers runtime types stay out of the build). */
type D1Database = ConstructorParameters<typeof PrismaD1>[0];

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const d1Clients = new WeakMap<D1Database, PrismaClient>();

/** The D1 binding when running on Cloudflare Workers; undefined under Node (docker / next dev / tests). */
function d1(): D1Database | undefined {
  try {
    return (getCloudflareContext().env as { DB?: D1Database }).DB;
  } catch {
    return undefined;
  }
}

function client(): PrismaClient {
  const db = d1();
  if (db) {
    let c = d1Clients.get(db);
    if (!c) d1Clients.set(db, (c = new PrismaClient({ adapter: new PrismaD1(db) })));
    return c;
  }
  if (!globalForPrisma.prisma) {
    const url = process.env.DATABASE_URL ?? "file:./data/apslop.db";
    globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  }
  return globalForPrisma.prisma;
}

/**
 * Prisma client for the current runtime: Cloudflare D1 on Workers (the binding only exists inside
 * a request, hence the lazy lookup), SQLite via libsql elsewhere.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, key) {
    const c = client();
    const value = Reflect.get(c, key, c);
    return typeof value === "function" ? value.bind(c) : value;
  },
});
