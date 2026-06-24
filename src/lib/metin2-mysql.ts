import crypto from 'crypto';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.M2_DB_HOST || process.env.DB_HOST,
  port: Number(process.env.M2_DB_PORT || process.env.DB_PORT || 3306),
  user: process.env.M2_DB_USER || process.env.DB_USER,
  password: process.env.M2_DB_PASS || process.env.DB_PASS,
  database: process.env.M2_DB_ACCOUNT || process.env.DB_NAME || 'account',
};

function requireDbConfig() {
  const missing = Object.entries(dbConfig)
    .filter(([key, value]) => key !== 'port' && !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error('Configuracao de dados incompleta.');
  }
}

export const metin2Pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: Number(process.env.M2_DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  enableKeepAlive: true,
});

export const metin2PlayerPool = mysql.createPool({
  ...dbConfig,
  database: process.env.M2_DB_PLAYER || process.env.DB_PLAYER || 'player',
  waitForConnections: true,
  connectionLimit: Number(process.env.M2_DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  enableKeepAlive: true,
});

export interface Metin2Account {
  id: number;
  login: string;
  email: string | null;
  status: string | null;
  coins: number;
}

export interface Metin2Character {
  id: number;
  name: string;
  kingdom: 'Shinsoo' | 'Chunjo' | 'Jinno';
  classType: string;
  level: number;
  playedTime: string;
  mapIndex?: number;
  x?: number;
  y?: number;
}

export function hashMetin2Password(password: string): string {
  const first = crypto.createHash('sha1').update(password).digest();
  return `*${crypto.createHash('sha1').update(first).digest('hex').toUpperCase()}`;
}

function sessionSecret() {
  return process.env.M2_WEB_SESSION_SECRET || process.env.M2_SECURITY_SALT || process.env.NEXTAUTH_SECRET || 'dev-only-change-this-secret';
}

export function signAccountSession(login: string): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ login, issuedAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyAccountSession(token: string | undefined | null): { login: string } | null {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed.login || typeof parsed.login !== 'string') return null;
    return { login: parsed.login };
  } catch {
    return null;
  }
}

export function normalizeLogin(login: string): string {
  return login.trim().toLowerCase();
}

export function kingdomFromEmpire(empire: number): 'Shinsoo' | 'Chunjo' | 'Jinno' {
  if (empire === 2) return 'Chunjo';
  if (empire === 3) return 'Jinno';
  return 'Shinsoo';
}

export function classNameFromJob(job: number): string {
  const baseJob = Number(job) % 4;
  return ['Guerreiro', 'Ninja', 'Shura', 'Shaman'][baseJob] || 'Classe';
}

function safeCityPosition(empire: number) {
  if (empire === 2) return { mapIndex: 21, x: 55700, y: 157900 };
  if (empire === 3) return { mapIndex: 41, x: 958300, y: 255200 };
  return { mapIndex: 1, x: 473434, y: 953856 };
}

export function assertValidLogin(login: string) {
  if (!/^[a-z0-9]{4,20}$/i.test(login)) {
    throw new Error('O login deve conter apenas letras e numeros, entre 4 e 20 caracteres.');
  }
}

export function assertValidPassword(password: string) {
  if (password.length < 6 || password.length > 24) {
    throw new Error('A senha deve ter entre 6 e 24 caracteres.');
  }
}

export async function findAccountByLogin(login: string): Promise<Metin2Account | null> {
  requireDbConfig();
  const [rows] = await metin2Pool.execute<mysql.RowDataPacket[]>(
    'SELECT id, login, email, status, coins FROM account WHERE login = ? LIMIT 1',
    [login]
  );

  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    id: Number(row.id),
    login: String(row.login),
    email: row.email ? String(row.email) : null,
    status: row.status ? String(row.status) : null,
    coins: Number(row.coins || 0),
  };
}

export async function verifyAccountPassword(login: string, password: string): Promise<Metin2Account | null> {
  requireDbConfig();
  const [rows] = await metin2Pool.execute<mysql.RowDataPacket[]>(
    'SELECT id, login, email, status, coins, password FROM account WHERE login = ? LIMIT 1',
    [login]
  );

  if (rows.length === 0) return null;
  const row = rows[0];
  const storedHash = String(row.password || '');
  const providedHash = hashMetin2Password(password);

  const storedBuffer = Buffer.from(storedHash);
  const providedBuffer = Buffer.from(providedHash);
  if (storedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(storedBuffer, providedBuffer)) {
    return null;
  }

  return {
    id: Number(row.id),
    login: String(row.login),
    email: row.email ? String(row.email) : null,
    status: row.status ? String(row.status) : null,
    coins: Number(row.coins || 0),
  };
}

export async function getAccountCharacters(accountId: number): Promise<Metin2Character[]> {
  requireDbConfig();
  const [rows] = await metin2PlayerPool.execute<mysql.RowDataPacket[]>(
    `SELECT p.id, p.name, p.level, p.job, p.playtime, p.map_index, p.x, p.y, COALESCE(pi.empire, 1) AS empire
     FROM player p
     LEFT JOIN player_index pi ON pi.id = p.account_id
     WHERE p.account_id = ?
     ORDER BY p.level DESC, p.exp DESC`,
    [accountId]
  );

  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    kingdom: kingdomFromEmpire(Number(row.empire || 1)),
    classType: classNameFromJob(Number(row.job || 0)),
    level: Number(row.level || 1),
    playedTime: `${Math.floor(Number(row.playtime || 0) / 60)}h`,
    mapIndex: Number(row.map_index || 0),
    x: Number(row.x || 0),
    y: Number(row.y || 0),
  }));
}

export async function unstickAccountCharacter(login: string, characterId: number) {
  requireDbConfig();

  const account = await findAccountByLogin(login);
  if (!account) {
    throw new Error('Conta nao encontrada.');
  }

  const [rows] = await metin2PlayerPool.execute<mysql.RowDataPacket[]>(
    `SELECT p.id, p.name, COALESCE(pi.empire, 1) AS empire
     FROM player p
     LEFT JOIN player_index pi ON pi.id = p.account_id
     WHERE p.id = ? AND p.account_id = ?
     LIMIT 1`,
    [characterId, account.id]
  );

  if (rows.length === 0) {
    throw new Error('Personagem nao encontrado nesta conta.');
  }

  const character = rows[0];
  const position = safeCityPosition(Number(character.empire || 1));

  await metin2PlayerPool.execute(
    `UPDATE player
     SET map_index = ?, x = ?, y = ?, exit_map_index = 0, exit_x = 0, exit_y = 0
     WHERE id = ? AND account_id = ?`,
    [position.mapIndex, position.x, position.y, characterId, account.id]
  );

  return {
    id: Number(character.id),
    name: String(character.name),
    ...position,
  };
}

export async function createAccount(params: {
  login: string;
  password: string;
  email: string;
  socialId: string;
}) {
  requireDbConfig();
  await metin2Pool.execute(
    `INSERT INTO account
      (login, password, email, social_id, create_time, status, coins)
     VALUES
      (?, ?, ?, ?, NOW(), 'OK', 0)`,
    [params.login, hashMetin2Password(params.password), params.email, params.socialId]
  );

  return findAccountByLogin(params.login);
}

export async function redeemMysqlCoupon(login: string, code: string, amount: number) {
  requireDbConfig();
  const connection = await metin2Pool.getConnection();

  try {
    await connection.query(`CREATE TABLE IF NOT EXISTS web_coupon_logs (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      login VARCHAR(30) NOT NULL,
      coupon VARCHAR(64) NOT NULL,
      date_redeemed DATETIME NOT NULL,
      amount INT NOT NULL,
      UNIQUE KEY uniq_web_coupon_login_coupon (login, coupon)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await connection.beginTransaction();

    await connection.execute(
      'INSERT INTO web_coupon_logs (login, coupon, date_redeemed, amount) VALUES (?, ?, NOW(), ?)',
      [login, code, amount]
    );

    const [result] = await connection.execute<mysql.ResultSetHeader>(
      'UPDATE account SET coins = coins + ? WHERE login = ?',
      [amount, login]
    );

    if (result.affectedRows !== 1) {
      throw new Error('Conta nao encontrada para creditar cupom.');
    }

    await connection.commit();
    const account = await findAccountByLogin(login);
    return account?.coins ?? 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
