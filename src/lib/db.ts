import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.M2_DB_HOST || process.env.DB_HOST,
  port: Number(process.env.M2_DB_PORT || process.env.DB_PORT || 3306),
  user: process.env.M2_DB_USER || process.env.DB_USER,
  password: process.env.M2_DB_PASS || process.env.DB_PASS,
  database: process.env.M2_DB_ACCOUNT || process.env.DB_NAME || 'account',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

export default pool;
