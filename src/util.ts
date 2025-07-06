import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.PG_CONN_STRING,
  ssl: { rejectUnauthorized: false },
});

export const query = async (text: string, params?: string[]) => {
  const res = params ? await pool.query(text, params) : await pool.query(text);
  return res.rows;
};
