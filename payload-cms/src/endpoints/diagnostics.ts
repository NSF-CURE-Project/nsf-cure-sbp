import type { Endpoint } from "payload";

const buildCounts = (rows: Array<{ count: string | number }>) => {
  const value = rows[0]?.count;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
};

export const diagnosticsEndpoint: Endpoint = {
  path: "/admin/diagnostics",
  method: "get",
  handler: async (req) => {
    const payload = req.payload;
    const pool = payload?.db?.pool;

    if (!pool || typeof pool.query !== "function") {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "Database pool not available.",
        }),
        { status: 500 },
      );
    }

    const tables = [
      "classes",
      "chapters",
      "lessons",
      "_classes_v",
      "_chapters_v",
      "_lessons_v",
    ];

    const tableStatus: Record<string, { exists: boolean; count?: number }> = {};

    for (const table of tables) {
      const existsRes = await pool.query(
        `SELECT to_regclass('public.${table}') AS name`,
      );
      const exists = Boolean(existsRes.rows?.[0]?.name);
      if (!exists) {
        tableStatus[table] = { exists: false };
        continue;
      }

      const countRes = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
      tableStatus[table] = { exists: true, count: buildCounts(countRes.rows) };
    }

    const response = {
      ok: true,
      tables: tableStatus,
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
