/* Diagnostic: inspect PostgreSQL schema + row counts for AnimaFind. */
const { Client } = require("pg");

const url =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

(async () => {
  const c = new Client({ connectionString: url });
  try {
    await c.connect();
    const t = await c.query(
      `select table_name from information_schema.tables where table_schema='public' order by 1`
    );
    if (!t.rows.length) {
      console.log("TABLES: (none - schema not pushed)");
    } else {
      console.log("TABLES: " + t.rows.map((r) => r.table_name).join(", "));
      for (const r of t.rows) {
        const n = await c.query(`select count(*)::int as n from "${r.table_name}"`);
        console.log(`  ${r.table_name}: ${n.rows[0].n}`);
      }
    }
  } catch (e) {
    console.log("DB ERROR:", e.message);
  } finally {
    await c.end().catch(() => {});
  }
})();
