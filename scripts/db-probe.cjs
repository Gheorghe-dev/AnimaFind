/* Probe: try common local credentials against the AnimaFind database. */
const { Client } = require("pg");

const users = ["postgres", "admin", "animafind"];
const passwords = ["postgres", "123456", "password", "admin", "root", "postgres123", ""];
const dbs = ["app_db", "postgres"];

(async () => {
  for (const u of users) {
    for (const p of passwords) {
      for (const d of dbs) {
        const c = new Client({
          connectionString: `postgresql://${u}:${encodeURIComponent(p)}@127.0.0.1:5432/${d}`,
          connectionTimeoutMillis: 3000,
        });
        try {
          await c.connect();
          const r = await c.query("select current_user, current_database()");
          console.log(`OK  -> ${u}:${p} @ ${d} =>`, JSON.stringify(r.rows[0]));
          await c.end();
          return;
        } catch (e) {
          await c.end().catch(() => {});
        }
      }
    }
  }
  console.log("no credential combination worked");
})();
