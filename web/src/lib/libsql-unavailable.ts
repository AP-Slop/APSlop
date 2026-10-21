// Stands in for @prisma/adapter-libsql in the Cloudflare build (see next.config.ts), where D1 is
// the database; keeps libsql and its native binaries out of the Worker.
export class PrismaLibSql {
  constructor() {
    throw new Error("SQLite (libsql) is not available on Cloudflare Workers; the D1 binding DB is missing.");
  }
}
