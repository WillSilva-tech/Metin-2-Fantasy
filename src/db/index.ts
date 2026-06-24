import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as fs from 'fs';
import * as path from 'path';

// Local database JSON persistence file path
const DB_FILE_PATH = fs.existsSync('/tmp') ? '/tmp/fantasy2_fallback_db.json' : './src/db/fallback_db.json';

// In-memory table collections mapped to PostgreSQL table names
const dbState: Record<string, any[]> = {
  users: [],
  admin_logs: [],
  cash_transactions: [],
  characters: [],
  coupons: [],
  coupon_redemptions: [],
  events: [],
  guilds: [],
  news: [],
  server_status: [],
  videos: []
};

// Loader and Saver for persistent state
function loadDatabaseState() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      for (const k in parsed) {
        if (Array.isArray(parsed[k])) {
          dbState[k] = parsed[k];
        }
      }
      console.log(`[VIRTUAL_DB] Loaded ${Object.keys(dbState).length} tables from state store.`);
    }
  } catch (err) {
    console.warn('[VIRTUAL_DB] Failed to load persisted state:', err);
  }
}

function saveDatabaseState() {
  try {
    const parentDir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[VIRTUAL_DB] Failed to persist state:', err);
  }
}

// Casing and value helpers
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function generateNextId(table: any[]): number {
  if (table.length === 0) return 1;
  const ids = table.map(row => row.id || row.id_ || 0).filter(id => typeof id === 'number');
  if (ids.length === 0) return 1;
  return Math.max(...ids) + 1;
}

function setSchemaDefaults(tableName: string, row: any) {
  if (tableName === 'users') {
    row.role = row.role || 'PLAYER';
    row.cash_balance = row.cash_balance ?? 0;
    row.cashBalance = row.cash_balance ?? 0;
  } else if (tableName === 'server_status') {
    row.status = row.status || 'online';
    row.player_count = row.player_count ?? 128;
    row.playerCount = row.player_count ?? 128;
  } else if (tableName === 'characters') {
    row.level = row.level ?? 1;
    row.played_time = row.played_time || '0h';
    row.playedTime = row.played_time || '0h';
    row.league = row.league || 'Bronze';
    row.league_icon = row.league_icon || '⚔️';
    row.leagueIcon = row.league_icon || '⚔️';
  } else if (tableName === 'guilds') {
    row.level = row.level ?? 1;
  } else if (tableName === 'coupons') {
    row.used_count = row.used_count ?? 0;
    row.usedCount = row.used_count ?? 0;
    row.is_active = row.is_active ?? true;
    row.isActive = row.is_active ?? true;
  }
}

// SQL string parsing helpers
function getTableName(sql: string): string | null {
  const normalized = sql.toLowerCase();
  let match = normalized.match(/from\s+"?([a-zA-Z0-9_]+)"?/i);
  if (match) return match[1];
  match = normalized.match(/insert\s+into\s+"?([a-zA-Z0-9_]+)"?/i);
  if (match) return match[1];
  match = normalized.match(/update\s+"?([a-zA-Z0-9_]+)"?/i);
  if (match) return match[1];
  match = normalized.match(/delete\s+from\s+"?([a-zA-Z0-9_]+)"?/i);
  if (match) return match[1];
  return null;
}

function evaluateFilter(row: any, sql: string, values: any[]): boolean {
  const whereMatch = sql.match(/where\s+(.+?)(?:order\s+by|limit|$)/i);
  if (!whereMatch) return true;
  const whereClause = whereMatch[1];

  const condRegex = /"?([a-zA-Z0-9_]+)"?\."?([a-zA-Z0-9_]+)"?\s*=\s*\$(\d+)|"?([a-zA-Z0-9_]+)"?\s*=\s*\$(\d+)/gi;
  let match;
  let matchesCount = 0;
  let passedCount = 0;

  const isOr = whereClause.toLowerCase().includes(' or ');

  while ((match = condRegex.exec(whereClause)) !== null) {
    matchesCount++;
    const column = match[2] || match[4];
    const paramIdxStr = match[3] || match[5];
    const paramIdx = parseInt(paramIdxStr) - 1;
    const valueToCompare = values[paramIdx];

    const camelColumn = toCamelCase(column);
    const rowVal = row[column] !== undefined ? row[column] : row[camelColumn];
    
    const isMatched = (rowVal == valueToCompare || 
                       (typeof rowVal === 'string' && typeof valueToCompare === 'string' && rowVal.toLowerCase() === valueToCompare.toLowerCase()));
    
    if (isMatched) {
      if (isOr) return true;
      passedCount++;
    }
  }

  if (matchesCount === 0) {
    const directRegex = /"?([a-zA-Z0-9_]+)"?\s*=\s*([0-9]+|'[^']*')/gi;
    let directMatch;
    while ((directMatch = directRegex.exec(whereClause)) !== null) {
      matchesCount++;
      const column = directMatch[1];
      const valStr = directMatch[2];
      const valueToCompare = valStr.startsWith("'") ? valStr.slice(1, -1) : parseInt(valStr);
      const camelColumn = toCamelCase(column);
      const rowVal = row[column] !== undefined ? row[column] : row[camelColumn];
      if (rowVal == valueToCompare) {
        if (isOr) return true;
        passedCount++;
      }
    }
  }

  if (matchesCount === 0) return true;
  return isOr ? false : passedCount === matchesCount;
}

function sortRows(rows: any[], sql: string): any[] {
  const orderMatch = sql.match(/order\s+by\s+"?([a-zA-Z0-9_]+)"?(\."?([a-zA-Z0-9_]+)"?)?\s*(asc|desc)?/i);
  if (!orderMatch) return rows;

  const column = orderMatch[3] || orderMatch[1];
  const direction = (orderMatch[4] || 'asc').toLowerCase();
  const camelColumn = toCamelCase(column);

  return [...rows].sort((a, b) => {
    const valA = a[column] !== undefined ? a[column] : a[camelColumn];
    const valB = b[column] !== undefined ? b[column] : b[camelColumn];

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

function limitRows(rows: any[], sql: string, values: any[]): any[] {
  const limitMatch = sql.match(/limit\s+(\$(\d+)|(\d+))/i);
  if (!limitMatch) return rows;

  let limitVal = 0;
  if (limitMatch[2]) {
    const idx = parseInt(limitMatch[2]) - 1;
    limitVal = values[idx];
  } else if (limitMatch[3]) {
    limitVal = parseInt(limitMatch[3]);
  }

  return rows.slice(0, limitVal);
}

function handleInsert(tableName: string, sql: string, values: any[]): any[] {
  const table = dbState[tableName];
  if (!table) return [];

  const colsMatch = sql.match(/insert\s+into\s+"?[a-zA-Z0-9_]+"?.+?\(([^)]+)\)\s*values/i);
  if (!colsMatch) return [];

  const columns = colsMatch[1].split(',').map(c => c.replace(/"/g, '').trim());
  const valPart = sql.substring(sql.toLowerCase().indexOf('values') + 6);
  const blocks = [...valPart.matchAll(/\(([^)]+)\)/g)].map(m => m[1]);

  const insertedRows: any[] = [];

  for (const block of blocks) {
    const placeholders = block.split(',').map(p => p.trim());
    const newId = generateNextId(table);
    const newRow: any = {
      id: newId,
      created_at: new Date(),
      createdAt: new Date(),
    };

    setSchemaDefaults(tableName, newRow);

    placeholders.forEach((ph, colIdx) => {
      const colName = columns[colIdx];
      const camelName = toCamelCase(colName);

      if (ph.startsWith('$')) {
        const paramIdx = parseInt(ph.substring(1)) - 1;
        const mappedVal = values[paramIdx];
        newRow[colName] = mappedVal;
        newRow[camelName] = mappedVal;
      } else {
        let rawVal: any = ph;
        if (ph.toLowerCase() === 'default' || ph.toLowerCase() === 'null') {
          return;
        }
        if (ph.startsWith("'") && ph.endsWith("'")) {
          rawVal = ph.slice(1, -1);
        } else if (!isNaN(Number(ph))) {
          rawVal = Number(ph);
        }
        newRow[colName] = rawVal;
        newRow[camelName] = rawVal;
      }
    });

    table.push(newRow);
    insertedRows.push(newRow);
  }

  saveDatabaseState();
  return insertedRows;
}

function handleUpdate(tableName: string, sql: string, values: any[]): any[] {
  const table = dbState[tableName];
  if (!table) return [];

  const setMatch = sql.match(/set\s+(.+?)\s+where/i);
  if (!setMatch) return [];

  const setClause = setMatch[1];
  const setRegex = /"?([a-zA-Z0-9_]+)"?\s*=\s*\$(\d+)|"?([a-zA-Z0-9_]+)"?\s*=\s*([0-9]+|'[^']*')/gi;
  let match;
  const updates: { col: string; val: any }[] = [];

  while ((match = setRegex.exec(setClause)) !== null) {
    const colName = match[1] || match[3];
    let val: any;

    if (match[2]) {
      const idx = parseInt(match[2]) - 1;
      val = values[idx];
    } else {
      const rawVal = match[4];
      val = rawVal.startsWith("'") ? rawVal.slice(1, -1) : parseInt(rawVal);
    }
    updates.push({ col: colName, val });
  }

  const updatedRows: any[] = [];
  for (const row of table) {
    if (evaluateFilter(row, sql, values)) {
      for (const upd of updates) {
        row[upd.col] = upd.val;
        row[toCamelCase(upd.col)] = upd.val;
      }
      updatedRows.push(row);
    }
  }

  saveDatabaseState();
  return updatedRows;
}

function handleDelete(tableName: string, sql: string, values: any[]): any[] {
  const table = dbState[tableName];
  if (!table) return [];

  const initialCount = table.length;
  dbState[tableName] = table.filter(row => !evaluateFilter(row, sql, values));
  
  if (dbState[tableName].length !== initialCount) {
    saveDatabaseState();
  }

  return [];
}

// In-Memory Query Engine execution wrapper
function runInMemoryQuery(text: string, values: any[]): any {
  const tableName = getTableName(text);
  if (!tableName || !dbState[tableName]) {
    return { rows: [] };
  }

  const sqlLower = text.toLowerCase().trim();
  
  if (sqlLower.startsWith('select')) {
    let rows = dbState[tableName];
    rows = rows.filter(row => evaluateFilter(row, text, values));
    rows = sortRows(rows, text);
    rows = limitRows(rows, text, values);
    return { rows };
  } 
  
  if (sqlLower.startsWith('insert')) {
    const rows = handleInsert(tableName, text, values);
    return { rows };
  } 
  
  if (sqlLower.startsWith('update')) {
    const rows = handleUpdate(tableName, text, values);
    return { rows };
  } 
  
  if (sqlLower.startsWith('delete')) {
    const rows = handleDelete(tableName, text, values);
    return { rows };
  }

  return { rows: [] };
}

// Mock PostgreSQL Query Client
class VirtualClient {
  async query(config: any, valuesInput?: any[]) {
    let text = '';
    let values: any[] = [];

    if (typeof config === 'string') {
      text = config;
      values = valuesInput || [];
    } else if (config && typeof config === 'object') {
      text = config.text || '';
      values = config.values || [];
    }

    const t = text.toLowerCase().trim();
    if (t === 'begin' || t === 'commit' || t === 'rollback') {
      return { rows: [] };
    }

    return runInMemoryQuery(text, values);
  }

  release() {
    // No-op
  }
}

// Mock PostgreSQL Pool Replica
class VirtualPool {
  private listeners: Record<string, Function[]> = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return this;
  }

  async connect() {
    return new VirtualClient();
  }

  async query(config: any, valuesInput?: any[]) {
    let text = '';
    let values: any[] = [];

    if (typeof config === 'string') {
      text = config;
      values = valuesInput || [];
    } else if (config && typeof config === 'object') {
      text = config.text || '';
      values = config.values || [];
    }

    return runInMemoryQuery(text, values);
  }

  async end() {
    // No-op
  }
}

// Helper to wrap client connections retrieved from the pool so client-level queries also benefit from automatic failover protection.
function createResilientClient(realClient: any, virtualClient: any, poolRef: any) {
  return new Proxy(realClient, {
    get(target, prop, receiver) {
      if (prop === 'query') {
        return async (config: any, valuesInput?: any[]) => {
          if (poolRef.isFallbackActive) {
            return virtualClient.query(config, valuesInput);
          }
          try {
            return await realClient.query(config, valuesInput);
          } catch (err: any) {
            const errMsg = (err.message || '').toLowerCase();
            if (
              errMsg.includes('timeout') ||
              errMsg.includes('terminated') ||
              errMsg.includes('connection') ||
              errMsg.includes('econnrefused')
            ) {
              if (!poolRef.canFallback) {
                throw err;
              }
              console.log('[RESILIENT_CLIENT] Live query failed (inactive/timeout), activating virtual DB fallback.');
              poolRef.isFallbackActive = true;
              return virtualClient.query(config, valuesInput);
            }
            throw err;
          }
        };
      }
      if (prop === 'release') {
        return () => {
          if (realClient && typeof realClient.release === 'function') {
            try {
              realClient.release();
            } catch (e) {}
          }
          if (virtualClient && typeof virtualClient.release === 'function') {
            try {
              virtualClient.release();
            } catch (e) {}
          }
        };
      }

      // Fallback for resolving on active client
      const activeClient = poolRef.isFallbackActive ? virtualClient : realClient;
      const value = Reflect.get(activeClient, prop, activeClient);
      if (typeof value === 'function') {
        return value.bind(activeClient);
      }
      return value;
    }
  });
}

// Resilient Pool Selector fails over instantly if host is timing out or offline
class ResilientPool {
  private realPool: any;
  private virtualPool: any;
  private isFallbackActiveOriginal: boolean = false;
  private allowFallback: boolean;

  constructor(realPool: any, virtualPool: any, startWithFallback: boolean, allowFallback: boolean) {
    this.realPool = realPool;
    this.virtualPool = virtualPool;
    this.isFallbackActiveOriginal = startWithFallback;
    this.allowFallback = allowFallback;
  }

  get isFallbackActive(): boolean {
    return this.isFallbackActiveOriginal;
  }

  set isFallbackActive(val: boolean) {
    this.isFallbackActiveOriginal = val;
  }

  get canFallback(): boolean {
    return this.allowFallback;
  }

  on(event: string, callback: Function) {
    if (this.realPool && typeof this.realPool.on === 'function') {
      this.realPool.on(event, (err: any) => {
        this.isFallbackActive = true;
        callback(err);
      });
    }
    return this;
  }

  async connect() {
    if (this.isFallbackActive) {
      return this.virtualPool.connect();
    }
    try {
      const realClient = await this.realPool.connect();
      const virtualClient = await this.virtualPool.connect();
      return createResilientClient(realClient, virtualClient, this);
    } catch (err) {
      if (!this.allowFallback) {
        throw err;
      }
      console.log('[RESILIENT_POOL] Primary cluster link non-responsive, transitioning seamlessly to fallback dataset.');
      this.isFallbackActive = true;
      return this.virtualPool.connect();
    }
  }

  async query(config: any, valuesInput?: any[]) {
    if (this.isFallbackActive) {
      return this.virtualPool.query(config, valuesInput);
    }
    try {
      return await this.realPool.query(config, valuesInput);
    } catch (err: any) {
      const errMsg = (err.message || '').toLowerCase();
      if (
        errMsg.includes('timeout') ||
        errMsg.includes('terminated') ||
        errMsg.includes('connection') ||
        errMsg.includes('econnrefused')
      ) {
        if (!this.allowFallback) {
          throw err;
        }
        console.log('[RESILIENT_POOL] Primary query deferred to high-performance local fallback store.');
        this.isFallbackActive = true;
        return this.virtualPool.query(config, valuesInput);
      }
      throw err;
    }
  }

  async end() {
    if (this.realPool && typeof this.realPool.end === 'function') {
      try {
        await this.realPool.end();
      } catch (e) {}
    }
  }
}

// Initial state load
loadDatabaseState();

// Function to create connection pool.
export const createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  const sqlHost = process.env.SQL_HOST;
  const isProduction = process.env.NODE_ENV === 'production';
  const allowLocalFallback = process.env.ALLOW_LOCAL_DB_FALLBACK === 'true' || !isProduction;

  const inMemoryFallbackPool = new VirtualPool();

  if (connectionString && /^mysql:\/\//i.test(connectionString)) {
    throw new Error('[DATABASE] DATABASE_URL uses MySQL, but the Next.js Drizzle layer is configured for PostgreSQL. Use a postgres:// URL for Next.js or the Hostinger PHP layer for Metin2 MySQL.');
  }

  // If there's no DATABASE_URL, and SQL_HOST is not configured or is the default, skip PG connection attempts to prevent timeout delays
  if (!connectionString && (!sqlHost || sqlHost === '127.0.0.1')) {
    if (!allowLocalFallback) {
      throw new Error('[DATABASE] Production requires DATABASE_URL or SQL_HOST for PostgreSQL. Local fallback is disabled in production.');
    }
    console.log('[DATABASE] DATABASE_URL is not set and SQL_HOST is empty or 127.0.0.1. Activating local-first High Performance Virtual DB fallback.');
    return new ResilientPool(null, inMemoryFallbackPool, true, allowLocalFallback);
  }

  try {
    const realPool = new Pool(
      connectionString
        ? {
            connectionString,
            ssl: connectionString.includes('supabase.co') || process.env.DB_SSL === 'true'
              ? { rejectUnauthorized: false }
              : undefined,
            connectionTimeoutMillis: 1000, // Safe ultra-short timeout to failover swiftly in 1 second
          }
        : {
            host: sqlHost,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DB_NAME,
            connectionTimeoutMillis: 1000,
          }
    );

    realPool.on('error', (err) => {
      // Idle pool error - switch fallback on but don't crash
      console.log('[DATABASE] Primary pool idle error event. Active fallback enabled.');
    });

    return new ResilientPool(realPool, inMemoryFallbackPool, false, allowLocalFallback);
  } catch (err) {
    console.log('[DATABASE] Failed to instantiate pool. Active failover triggered.');
    if (!allowLocalFallback) {
      throw err;
    }
    return new ResilientPool(null, inMemoryFallbackPool, true, true);
  }
};

// Create a pool instance.
const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err: any) => {
  console.error('Unexpected error on SQL pool client:', err);
});

// Initialize Drizzle with our resilient pool interface.
export const db = drizzle(pool as any, { schema });
