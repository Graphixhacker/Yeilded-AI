import fs from 'fs';
import path from 'path';
import { Pool as NeonPool } from '@neondatabase/serverless';
import pg from 'pg';
import type {
  User,
  PositionPaperDraft,
  SpeechDraft,
  ResolutionDraft,
  StudyGuide
} from '../src/types/index.js';

export interface PasswordResetToken {
  tokenHash: string;
  userId: string;
  expiresAt: number;
  used: boolean;
  createdAt: number;
}

export interface UsageLog {
  id: string;
  userId: string;
  feature: string;
  timestamp: number;
  date: string;
}

export interface Partnership {
  id: string;
  affiliateCode: string;
  name: string;
  referredUsers?: number;
  paidConversions?: number;
  createdAt?: string;
  [key: string]: any;
}

// Serverless-friendly connection pool
let pool: any = null;

function getDbPool(): any {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString) return null;

    try {
      pool = new NeonPool({ connectionString });
    } catch {
      pool = new pg.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10
      });
    }
  }
  return pool;
}

export async function executeQuery(text: string, params: any[] = []): Promise<any> {
  const connStr = process.env.DATABASE_URL?.trim();
  if (!connStr) {
    throw new Error('DATABASE_URL environment variable is not configured.');
  }

  if (!pool) {
    try {
      pool = new NeonPool({ connectionString: connStr });
    } catch {
      pool = new pg.Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        max: 10
      });
    }
  }

  try {
    return await pool.query(text, params);
  } catch (err: any) {
    // If neon pool failed on transport/protocol, retry with pg.Pool once
    if (pool instanceof NeonPool) {
      try {
        pool = new pg.Pool({
          connectionString: connStr,
          ssl: { rejectUnauthorized: false },
          max: 10
        });
        return await pool.query(text, params);
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw err;
  }
}

function rowToUser(row: any): User {
  const daily = typeof row.daily_generations === 'string'
    ? JSON.parse(row.daily_generations)
    : (row.daily_generations || { date: '', count: 0 });

  const chat = row.chat_usage
    ? (typeof row.chat_usage === 'string' ? JSON.parse(row.chat_usage) : row.chat_usage)
    : undefined;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar || undefined,
    tier: row.tier as any,
    passExpiresAt: row.pass_expires_at ? Number(row.pass_expires_at) : null,
    generationsUsed: Number(row.generations_used || 0),
    dailyGenerations: daily,
    chatUsage: chat,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString()),
    banned: Boolean(row.banned),
    ...(row.affiliate_code ? { affiliateCode: row.affiliate_code } : {})
  };
}

function rowToStudyGuide(row: any): StudyGuide {
  const summary = typeof row.summary === 'string' ? JSON.parse(row.summary) : (row.summary || {});
  return {
    id: row.id,
    userId: row.user_id,
    committeeId: row.committee_id,
    committeeName: row.committee_name,
    topic: row.topic || undefined,
    fileName: row.file_name || undefined,
    fileSize: row.file_size ? Number(row.file_size) : undefined,
    pageCount: row.page_count ? Number(row.page_count) : undefined,
    rawText: row.raw_text || '',
    summary,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString()),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at || new Date().toISOString())
  };
}

class DBManager {
  private initPromise: Promise<void> | null = null;
  private memoryData: any = null;

  private get hasPostgres(): boolean {
    return Boolean(process.env.DATABASE_URL?.trim());
  }

  private loadMemoryFallback(): any {
    if (this.memoryData) return this.memoryData;
    try {
      const jsonPath = path.resolve(process.cwd(), 'data', 'mun_database.json');
      if (fs.existsSync(jsonPath)) {
        this.memoryData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        return this.memoryData;
      }
    } catch (e) {
      console.warn('[DB] Could not load memory fallback from JSON:', e);
    }
    this.memoryData = {
      users: {},
      passwords: {},
      tokens: {},
      passwordResetTokens: [],
      positionPapers: [],
      speeches: [],
      resolutions: [],
      crisisNotes: [],
      usageLogs: [],
      studyGuides: [],
      partnerships: []
    };
    return this.memoryData;
  }

  private async ensureInit(): Promise<void> {
    if (!this.hasPostgres) {
      this.loadMemoryFallback();
      return;
    }

    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          await this.createTables();
          await this.seedFromJsonIfEmpty();
        } catch (err) {
          console.error('[DB INIT ERROR]', err);
          this.initPromise = null;
          throw err;
        }
      })();
    }
    await this.initPromise;
  }

  private async createTables(): Promise<void> {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar TEXT,
        tier VARCHAR(32) NOT NULL DEFAULT 'free',
        pass_expires_at BIGINT,
        generations_used INT NOT NULL DEFAULT 0,
        daily_generations JSONB NOT NULL DEFAULT '{"date": "", "count": 0}',
        chat_usage JSONB DEFAULT '{"date": "", "count": 0, "lifetimeCount": 0}',
        banned BOOLEAN NOT NULL DEFAULT FALSE,
        affiliate_code VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS passwords (
        user_id VARCHAR(128) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tokens (
        token VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token_hash VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at BIGINT NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS position_papers (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS speeches (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS resolutions (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS crisis_notes (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS study_guides (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        committee_id VARCHAR(255) NOT NULL,
        committee_name VARCHAR(255) NOT NULL,
        topic TEXT,
        file_name VARCHAR(255),
        file_size BIGINT,
        page_count INT,
        raw_text TEXT,
        summary JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS usage_logs (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        feature VARCHAR(128) NOT NULL,
        timestamp BIGINT NOT NULL,
        date VARCHAR(32) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS partnerships (
        id VARCHAR(128) PRIMARY KEY,
        affiliate_code VARCHAR(128),
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
      CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
      CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_position_papers_user_id ON position_papers(user_id);
      CREATE INDEX IF NOT EXISTS idx_speeches_user_id ON speeches(user_id);
      CREATE INDEX IF NOT EXISTS idx_resolutions_user_id ON resolutions(user_id);
      CREATE INDEX IF NOT EXISTS idx_study_guides_user_id ON study_guides(user_id);
    `);
  }

  private async seedFromJsonIfEmpty(): Promise<void> {
    const res = await executeQuery('SELECT COUNT(*) as count FROM users');
    const count = parseInt(res.rows[0]?.count || '0', 10);
    if (count > 0) {
      console.log(`[DB] Users table already has ${count} records. Skipping initial seed.`);
      return;
    }

    console.log('[DB] Users table is empty. Checking for data/mun_database.json to seed...');
    let rawJson: string | null = null;
    const jsonPath = path.resolve(process.cwd(), 'data', 'mun_database.json');
    if (fs.existsSync(jsonPath)) {
      rawJson = fs.readFileSync(jsonPath, 'utf-8');
    }

    if (!rawJson) {
      console.log('[DB] No data/mun_database.json file found to seed.');
      return;
    }

    try {
      const data = JSON.parse(rawJson);
      console.log('[DB] Performing one-time import from data/mun_database.json into Postgres...');

      if (data.users && typeof data.users === 'object') {
        for (const [id, u] of Object.entries<any>(data.users)) {
          await executeQuery(`
            INSERT INTO users (id, email, name, avatar, tier, pass_expires_at, generations_used, daily_generations, chat_usage, banned, affiliate_code, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO NOTHING
          `, [
            u.id || id,
            u.email,
            u.name || u.email?.split('@')[0] || 'Delegate',
            u.avatar || null,
            u.tier || 'free',
            u.passExpiresAt || null,
            u.generationsUsed || 0,
            JSON.stringify(u.dailyGenerations || { date: '', count: 0 }),
            JSON.stringify(u.chatUsage || { date: '', count: 0, lifetimeCount: 0 }),
            Boolean(u.banned),
            u.affiliateCode || null,
            u.createdAt || new Date().toISOString()
          ]);
        }
      }

      if (data.passwords && typeof data.passwords === 'object') {
        for (const [userId, pass] of Object.entries<string>(data.passwords)) {
          await executeQuery(`
            INSERT INTO passwords (user_id, password_hash)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO NOTHING
          `, [userId, pass]);
        }
      }

      if (data.tokens && typeof data.tokens === 'object') {
        for (const [token, userId] of Object.entries<string>(data.tokens)) {
          await executeQuery(`
            INSERT INTO tokens (token, user_id)
            VALUES ($1, $2)
            ON CONFLICT (token) DO NOTHING
          `, [token, userId]);
        }
      }

      if (Array.isArray(data.passwordResetTokens)) {
        for (const r of data.passwordResetTokens) {
          await executeQuery(`
            INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, used, created_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (token_hash) DO NOTHING
          `, [r.tokenHash, r.userId, r.expiresAt, Boolean(r.used), r.createdAt]);
        }
      }

      if (Array.isArray(data.positionPapers)) {
        for (const p of data.positionPapers) {
          await executeQuery(`
            INSERT INTO position_papers (id, user_id, data, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO NOTHING
          `, [p.id, p.userId, JSON.stringify(p), p.createdAt || new Date().toISOString(), p.updatedAt || new Date().toISOString()]);
        }
      }

      if (Array.isArray(data.speeches)) {
        for (const s of data.speeches) {
          await executeQuery(`
            INSERT INTO speeches (id, user_id, data, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO NOTHING
          `, [s.id, s.userId, JSON.stringify(s), s.createdAt || new Date().toISOString(), s.updatedAt || new Date().toISOString()]);
        }
      }

      if (Array.isArray(data.resolutions)) {
        for (const r of data.resolutions) {
          await executeQuery(`
            INSERT INTO resolutions (id, user_id, data, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO NOTHING
          `, [r.id, r.userId, JSON.stringify(r), r.createdAt || new Date().toISOString(), r.updatedAt || new Date().toISOString()]);
        }
      }

      if (Array.isArray(data.studyGuides)) {
        for (const g of data.studyGuides) {
          await executeQuery(`
            INSERT INTO study_guides (id, user_id, committee_id, committee_name, topic, file_name, file_size, page_count, raw_text, summary, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO NOTHING
          `, [
            g.id,
            g.userId,
            g.committeeId || 'general',
            g.committeeName || 'Committee',
            g.topic || null,
            g.fileName || null,
            g.fileSize || null,
            g.pageCount || null,
            g.rawText || '',
            JSON.stringify(g.summary || {}),
            g.createdAt || new Date().toISOString(),
            g.updatedAt || new Date().toISOString()
          ]);
        }
      }

      if (Array.isArray(data.usageLogs)) {
        for (const l of data.usageLogs) {
          await executeQuery(`
            INSERT INTO usage_logs (id, user_id, feature, timestamp, date)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO NOTHING
          `, [l.id, l.userId, l.feature, l.timestamp, l.date]);
        }
      }

      if (Array.isArray(data.partnerships)) {
        for (const p of data.partnerships) {
          await executeQuery(`
            INSERT INTO partnerships (id, affiliate_code, data, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO NOTHING
          `, [p.id, p.affiliateCode || null, JSON.stringify(p), p.createdAt || new Date().toISOString()]);
        }
      }

      console.log('[DB] One-time database seed completed successfully!');
    } catch (err) {
      console.error('[DB SEED ERROR]', err);
    }
  }

  // --- USER METHODS ---
  public async getUser(userId: string): Promise<User | undefined> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT * FROM users WHERE id = $1', [userId]);
      if (res.rows.length === 0) return undefined;
      const user = rowToUser(res.rows[0]);
      if (user.passExpiresAt && Date.now() > user.passExpiresAt) {
        user.tier = 'free';
        user.passExpiresAt = null;
        await executeQuery('UPDATE users SET tier = $1, pass_expires_at = NULL WHERE id = $2', ['free', userId]);
      }
      return user;
    }

    const mem = this.loadMemoryFallback();
    const user = mem.users[userId];
    if (user && user.passExpiresAt && Date.now() > user.passExpiresAt) {
      user.tier = 'free';
      user.passExpiresAt = null;
    }
    return user;
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    const cleanEmail = email.trim().toLowerCase();
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT * FROM users WHERE LOWER(TRIM(email)) = $1', [cleanEmail]);
      if (res.rows.length === 0) return undefined;
      const user = rowToUser(res.rows[0]);
      if (user.passExpiresAt && Date.now() > user.passExpiresAt) {
        user.tier = 'free';
        user.passExpiresAt = null;
        await executeQuery('UPDATE users SET tier = $1, pass_expires_at = NULL WHERE id = $2', ['free', user.id]);
      }
      return user;
    }

    const mem = this.loadMemoryFallback();
    const user = Object.values<User>(mem.users).find(
      u => u.email.trim().toLowerCase() === cleanEmail
    );
    if (user && user.passExpiresAt && Date.now() > user.passExpiresAt) {
      user.tier = 'free';
      user.passExpiresAt = null;
    }
    return user;
  }

  public async getUserByToken(token: string): Promise<User | undefined> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery(`
        SELECT u.* FROM tokens t
        JOIN users u ON t.user_id = u.id
        WHERE t.token = $1
      `, [token]);
      if (res.rows.length === 0) return undefined;
      const user = rowToUser(res.rows[0]);
      if (user.passExpiresAt && Date.now() > user.passExpiresAt) {
        user.tier = 'free';
        user.passExpiresAt = null;
        await executeQuery('UPDATE users SET tier = $1, pass_expires_at = NULL WHERE id = $2', ['free', user.id]);
      }
      return user;
    }

    const mem = this.loadMemoryFallback();
    const userId = mem.tokens[token];
    return userId ? this.getUser(userId) : undefined;
  }

  public async createUser(email: string, name: string, passwordHash: string, affiliateCode?: string): Promise<{ user: User; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const id = 'user_' + Math.random().toString(36).substring(2, 9) + Date.now();
    const token = 'tok_' + Math.random().toString(36).substring(2, 15) + Date.now();
    const now = new Date().toISOString();
    const newUser: User = {
      id,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      tier: 'free',
      passExpiresAt: null,
      generationsUsed: 0,
      dailyGenerations: {
        date: now.slice(0, 10),
        count: 0
      },
      chatUsage: {
        date: now.slice(0, 10),
        count: 0,
        lifetimeCount: 0
      },
      createdAt: now,
      banned: false,
      ...(affiliateCode ? { affiliateCode } : {})
    };

    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery(`
        INSERT INTO users (id, email, name, tier, pass_expires_at, generations_used, daily_generations, chat_usage, banned, affiliate_code, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        id,
        cleanEmail,
        newUser.name,
        newUser.tier,
        null,
        0,
        JSON.stringify(newUser.dailyGenerations),
        JSON.stringify(newUser.chatUsage),
        false,
        affiliateCode || null,
        now
      ]);

      await executeQuery(`
        INSERT INTO passwords (user_id, password_hash)
        VALUES ($1, $2)
      `, [id, passwordHash]);

      await executeQuery(`
        INSERT INTO tokens (token, user_id, created_at)
        VALUES ($1, $2, NOW())
      `, [token, id]);

      if (affiliateCode) {
        const pRes = await executeQuery('SELECT * FROM partnerships WHERE affiliate_code = $1', [affiliateCode]);
        if (pRes.rows.length > 0) {
          const p = pRes.rows[0];
          const pData = typeof p.data === 'string' ? JSON.parse(p.data) : p.data;
          pData.referredUsers = (pData.referredUsers || 0) + 1;
          await executeQuery('UPDATE partnerships SET data = $1 WHERE id = $2', [JSON.stringify(pData), p.id]);
        }
      }

      return { user: newUser, token };
    }

    const mem = this.loadMemoryFallback();
    mem.users[id] = newUser;
    mem.passwords[id] = passwordHash;
    mem.tokens[token] = id;
    if (affiliateCode) {
      const p = (mem.partnerships || []).find((x: any) => x.affiliateCode === affiliateCode);
      if (p) p.referredUsers = (p.referredUsers || 0) + 1;
    }
    return { user: newUser, token };
  }

  public async ensureDemoDelegate(): Promise<{ user: User; token: string }> {
    let demoUser = await this.getUserByEmail('delegate@modelun.org');
    if (!demoUser) {
      return await this.createUser('delegate@modelun.org', 'Ambassador Alex Chen', 'diplomat2025');
    }
    const token = await this.createTokenForUser(demoUser.id);
    return { user: demoUser, token };
  }

  public async verifyPassword(userId: string, pass: string): Promise<boolean> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT password_hash FROM passwords WHERE user_id = $1', [userId]);
      if (res.rows.length === 0) return false;
      return res.rows[0].password_hash === pass;
    }
    const mem = this.loadMemoryFallback();
    return mem.passwords[userId] === pass;
  }

  public async savePasswordResetToken(resetToken: PasswordResetToken): Promise<void> {
    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery(`
        INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, used, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (token_hash) DO UPDATE SET used = EXCLUDED.used
      `, [resetToken.tokenHash, resetToken.userId, resetToken.expiresAt, resetToken.used, resetToken.createdAt]);
      return;
    }
    const mem = this.loadMemoryFallback();
    if (!mem.passwordResetTokens) mem.passwordResetTokens = [];
    mem.passwordResetTokens.push(resetToken);
  }

  public async getPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | undefined> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT * FROM password_reset_tokens WHERE token_hash = $1', [tokenHash]);
      if (res.rows.length === 0) return undefined;
      const r = res.rows[0];
      return {
        tokenHash: r.token_hash,
        userId: r.user_id,
        expiresAt: Number(r.expires_at),
        used: Boolean(r.used),
        createdAt: Number(r.created_at)
      };
    }
    const mem = this.loadMemoryFallback();
    return (mem.passwordResetTokens || []).find((t: any) => t.tokenHash === tokenHash);
  }

  public async markPasswordResetTokenUsed(tokenHash: string): Promise<void> {
    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery('UPDATE password_reset_tokens SET used = true WHERE token_hash = $1', [tokenHash]);
      return;
    }
    const mem = this.loadMemoryFallback();
    const r = (mem.passwordResetTokens || []).find((t: any) => t.tokenHash === tokenHash);
    if (r) r.used = true;
  }

  public async invalidateUserSessions(userId: string): Promise<void> {
    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery('DELETE FROM tokens WHERE user_id = $1', [userId]);
      return;
    }
    const mem = this.loadMemoryFallback();
    if (mem.tokens) {
      for (const [tok, uid] of Object.entries(mem.tokens)) {
        if (uid === userId) delete mem.tokens[tok];
      }
    }
  }

  public async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    if (this.hasPostgres) {
      await executeQuery(`
        INSERT INTO passwords (user_id, password_hash)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET password_hash = EXCLUDED.password_hash
      `, [userId, newPassword]);
      await this.invalidateUserSessions(userId);
      return true;
    }

    const mem = this.loadMemoryFallback();
    mem.passwords[userId] = newPassword;
    await this.invalidateUserSessions(userId);
    return true;
  }

  public async createTokenForUser(userId: string): Promise<string> {
    const token = 'tok_' + Math.random().toString(36).substring(2, 15) + Date.now();
    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery('INSERT INTO tokens (token, user_id, created_at) VALUES ($1, $2, NOW())', [token, userId]);
      return token;
    }
    const mem = this.loadMemoryFallback();
    mem.tokens[token] = userId;
    return token;
  }

  public async updateUserProfile(userId: string, name: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    user.name = name;
    if (this.hasPostgres) {
      await executeQuery('UPDATE users SET name = $1 WHERE id = $2', [name, userId]);
      return user;
    }
    return user;
  }

  public async updateUserTier(userId: string, tier: 'free' | '1week' | 'monthly'): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const now = Date.now();
    let expiresAt: number | null = null;
    if (tier === '1week') {
      expiresAt = now + 7 * 24 * 60 * 60 * 1000;
    } else if (tier === 'monthly') {
      expiresAt = now + 30 * 24 * 60 * 60 * 1000;
    }

    user.tier = tier;
    user.passExpiresAt = expiresAt;

    if (this.hasPostgres) {
      await executeQuery('UPDATE users SET tier = $1, pass_expires_at = $2 WHERE id = $3', [tier, expiresAt, userId]);
      return user;
    }
    return user;
  }

  public async setUserBanned(userId: string, banned: boolean): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    (user as any).banned = banned;
    if (this.hasPostgres) {
      await executeQuery('UPDATE users SET banned = $1 WHERE id = $2', [banned, userId]);
      return user;
    }
    return user;
  }

  public async getAllUsers(): Promise<User[]> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT * FROM users ORDER BY created_at DESC');
      return res.rows.map(rowToUser);
    }
    const mem = this.loadMemoryFallback();
    return Object.values(mem.users);
  }

  public async checkAndIncrementUsage(userId: string, feature: string): Promise<{ allowed: boolean; reason?: string }> {
    const user = await this.getUser(userId);
    if (!user) return { allowed: false, reason: 'User not authenticated' };

    const today = new Date().toISOString().slice(0, 10);
    if (user.dailyGenerations.date !== today) {
      user.dailyGenerations = { date: today, count: 0 };
    }

    // Rate limit: 50 requests per day across all tiers to prevent abuse
    if (user.dailyGenerations.count >= 50) {
      return { allowed: false, reason: 'Daily cap reached (50 generations/day). Resets tomorrow.' };
    }

    const isFree = user.tier === 'free';
    const isHeavyFeature = ['position-paper', 'speech', 'debate', 'crisis'].includes(feature);

    if (isFree && isHeavyFeature) {
      if (user.generationsUsed >= 3) {
        return {
          allowed: false,
          reason: 'Free tier limit reached (3/3 lifetime papers/speeches). Please activate a 1-Week Conference Pass or Monthly Pass.'
        };
      }
    }

    user.dailyGenerations.count += 1;
    if (isHeavyFeature) {
      user.generationsUsed += 1;
    }

    if (this.hasPostgres) {
      await executeQuery(`
        UPDATE users SET generations_used = $1, daily_generations = $2 WHERE id = $3
      `, [user.generationsUsed, JSON.stringify(user.dailyGenerations), userId]);

      await executeQuery(`
        INSERT INTO usage_logs (id, user_id, feature, timestamp, date)
        VALUES ($1, $2, $3, $4, $5)
      `, ['log_' + Math.random().toString(36).substring(2, 9), userId, feature, Date.now(), today]);

      return { allowed: true };
    }

    const mem = this.loadMemoryFallback();
    if (!mem.usageLogs) mem.usageLogs = [];
    mem.usageLogs.push({
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      userId,
      feature,
      timestamp: Date.now(),
      date: today
    });
    return { allowed: true };
  }

  public async checkAndIncrementChatUsage(userId?: string): Promise<{
    allowed: boolean;
    reason?: string;
    isChatLimitReached?: boolean;
    requireAuth?: boolean;
    remaining: number | 'unlimited';
    count: number;
  }> {
    if (!userId) {
      return {
        allowed: false,
        reason: 'Please sign in or create an account to use AI Chat (5 free messages per day).',
        requireAuth: true,
        remaining: 0,
        count: 0
      };
    }

    const user = await this.getUser(userId);
    if (!user) {
      return {
        allowed: false,
        reason: 'User not found. Please sign in again.',
        requireAuth: true,
        remaining: 0,
        count: 0
      };
    }

    const today = new Date().toISOString().slice(0, 10);
    if (!user.chatUsage || user.chatUsage.date !== today) {
      user.chatUsage = {
        date: today,
        count: 0,
        lifetimeCount: user.chatUsage?.lifetimeCount || 0
      };
    }

    const isPaid = user.tier === '1week' || user.tier === 'monthly';

    if (isPaid) {
      user.chatUsage.count += 1;
      user.chatUsage.lifetimeCount = (user.chatUsage.lifetimeCount || 0) + 1;
      if (this.hasPostgres) {
        await executeQuery('UPDATE users SET chat_usage = $1 WHERE id = $2', [JSON.stringify(user.chatUsage), userId]);
      }
      return {
        allowed: true,
        remaining: 'unlimited',
        count: user.chatUsage.count
      };
    }

    const FREE_CHAT_DAILY_LIMIT = 5;
    if (user.chatUsage.count >= FREE_CHAT_DAILY_LIMIT) {
      return {
        allowed: false,
        reason: 'Free tier limit reached (5 messages/day). Upgrade to a Conference Pass for unlimited AI Chat.',
        isChatLimitReached: true,
        remaining: 0,
        count: user.chatUsage.count
      };
    }

    user.chatUsage.count += 1;
    user.chatUsage.lifetimeCount = (user.chatUsage.lifetimeCount || 0) + 1;
    if (this.hasPostgres) {
      await executeQuery('UPDATE users SET chat_usage = $1 WHERE id = $2', [JSON.stringify(user.chatUsage), userId]);
    }
    return {
      allowed: true,
      remaining: Math.max(0, FREE_CHAT_DAILY_LIMIT - user.chatUsage.count),
      count: user.chatUsage.count
    };
  }

  public async getChatUsage(userId?: string): Promise<{
    remaining: number | 'unlimited';
    count: number;
    limit: number | 'unlimited';
    isFree: boolean;
    isChatLimitReached: boolean;
  }> {
    if (!userId) {
      return { remaining: 0, count: 0, limit: 5, isFree: true, isChatLimitReached: false };
    }
    const user = await this.getUser(userId);
    if (!user) {
      return { remaining: 0, count: 0, limit: 5, isFree: true, isChatLimitReached: false };
    }

    const today = new Date().toISOString().slice(0, 10);
    if (!user.chatUsage || user.chatUsage.date !== today) {
      user.chatUsage = {
        date: today,
        count: 0,
        lifetimeCount: user.chatUsage?.lifetimeCount || 0
      };
    }

    const isPaid = user.tier === '1week' || user.tier === 'monthly';
    if (isPaid) {
      return { remaining: 'unlimited', count: user.chatUsage.count, limit: 'unlimited', isFree: false, isChatLimitReached: false };
    }
    const rem = Math.max(0, 5 - user.chatUsage.count);
    return { remaining: rem, count: user.chatUsage.count, limit: 5, isFree: true, isChatLimitReached: rem === 0 };
  }

  // --- DRAFT OPERATIONS ---
  public async savePositionPaper(draft: PositionPaperDraft): Promise<PositionPaperDraft> {
    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery(`
        INSERT INTO position_papers (id, user_id, data, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `, [draft.id, draft.userId, JSON.stringify(draft), draft.createdAt || new Date().toISOString()]);
      return draft;
    }

    const mem = this.loadMemoryFallback();
    if (!mem.positionPapers) mem.positionPapers = [];
    const idx = mem.positionPapers.findIndex((p: any) => p.id === draft.id);
    if (idx >= 0) mem.positionPapers[idx] = draft;
    else mem.positionPapers.unshift(draft);
    return draft;
  }

  public async getPositionPapers(userId: string): Promise<PositionPaperDraft[]> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT * FROM position_papers WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
      return res.rows.map(r => typeof r.data === 'string' ? JSON.parse(r.data) : r.data);
    }
    const mem = this.loadMemoryFallback();
    return (mem.positionPapers || []).filter((p: any) => p.userId === userId);
  }

  public async deletePositionPaper(id: string, userId: string): Promise<boolean> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('DELETE FROM position_papers WHERE id = $1 AND user_id = $2', [id, userId]);
      return (res.rowCount || 0) > 0;
    }
    const mem = this.loadMemoryFallback();
    if (!mem.positionPapers) return false;
    const prevLen = mem.positionPapers.length;
    mem.positionPapers = mem.positionPapers.filter((p: any) => !(p.id === id && p.userId === userId));
    return mem.positionPapers.length !== prevLen;
  }

  public async saveSpeech(draft: SpeechDraft): Promise<SpeechDraft> {
    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery(`
        INSERT INTO speeches (id, user_id, data, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `, [draft.id, draft.userId, JSON.stringify(draft), draft.createdAt || new Date().toISOString()]);
      return draft;
    }
    const mem = this.loadMemoryFallback();
    if (!mem.speeches) mem.speeches = [];
    const idx = mem.speeches.findIndex((s: any) => s.id === draft.id);
    if (idx >= 0) mem.speeches[idx] = draft;
    else mem.speeches.unshift(draft);
    return draft;
  }

  public async getSpeeches(userId: string): Promise<SpeechDraft[]> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT * FROM speeches WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
      return res.rows.map(r => typeof r.data === 'string' ? JSON.parse(r.data) : r.data);
    }
    const mem = this.loadMemoryFallback();
    return (mem.speeches || []).filter((s: any) => s.userId === userId);
  }

  public async saveResolution(draft: ResolutionDraft): Promise<ResolutionDraft> {
    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery(`
        INSERT INTO resolutions (id, user_id, data, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `, [draft.id, draft.userId, JSON.stringify(draft), (draft as any).createdAt || draft.updatedAt || new Date().toISOString()]);
      return draft;
    }
    const mem = this.loadMemoryFallback();
    if (!mem.resolutions) mem.resolutions = [];
    const idx = mem.resolutions.findIndex((r: any) => r.id === draft.id);
    if (idx >= 0) mem.resolutions[idx] = draft;
    else mem.resolutions.unshift(draft);
    return draft;
  }

  public async getResolutions(userId: string): Promise<ResolutionDraft[]> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT * FROM resolutions WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
      return res.rows.map(r => typeof r.data === 'string' ? JSON.parse(r.data) : r.data);
    }
    const mem = this.loadMemoryFallback();
    return (mem.resolutions || []).filter((r: any) => r.userId === userId);
  }

  // --- STUDY GUIDE OPERATIONS ---
  public async getStudyGuides(userId: string): Promise<StudyGuide[]> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT * FROM study_guides WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
      return res.rows.map(rowToStudyGuide);
    }
    const mem = this.loadMemoryFallback();
    return (mem.studyGuides || []).filter((g: any) => g.userId === userId);
  }

  public async getStudyGuide(id: string, userId: string): Promise<StudyGuide | undefined> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT * FROM study_guides WHERE id = $1 AND user_id = $2', [id, userId]);
      if (res.rows.length === 0) return undefined;
      return rowToStudyGuide(res.rows[0]);
    }
    const mem = this.loadMemoryFallback();
    return (mem.studyGuides || []).find((g: any) => g.id === id && g.userId === userId);
  }

  public async findStudyGuideForCommittee(userId: string, committeeIdOrName: string): Promise<StudyGuide | undefined> {
    if (!committeeIdOrName || !committeeIdOrName.trim()) return undefined;
    const userGuides = await this.getStudyGuides(userId);
    if (userGuides.length === 0) return undefined;

    const queryStr = committeeIdOrName.trim().toLowerCase();

    // Exact match
    const exact = userGuides.find(g =>
      g.committeeId.toLowerCase() === queryStr ||
      g.committeeName.toLowerCase() === queryStr
    );
    if (exact) return exact;

    // Substring match
    const substring = userGuides.find(g => {
      const cId = g.committeeId.toLowerCase();
      const cName = g.committeeName.toLowerCase();
      return queryStr.includes(cId) || queryStr.includes(cName) || cId.includes(queryStr) || cName.includes(queryStr);
    });

    return substring;
  }

  public async canAddStudyGuide(userId: string): Promise<{ allowed: boolean; limit: number; currentCount: number; reason?: string }> {
    const user = await this.getUser(userId);
    const isPaid = user?.tier === '1week' || user?.tier === 'monthly';
    const limit = isPaid ? 5 : 1;
    const guides = await this.getStudyGuides(userId);
    const currentCount = guides.length;

    if (currentCount >= limit) {
      const reason = isPaid
        ? `You have reached the maximum of 5 study guides for your Conference Pass.`
        : `Free tier allows 1 study guide. Upgrade to a Conference Pass to upload up to 5 study guides.`;
      return { allowed: false, limit, currentCount, reason };
    }

    return { allowed: true, limit, currentCount };
  }

  public async saveStudyGuide(guide: StudyGuide): Promise<StudyGuide> {
    const now = new Date().toISOString();
    const fullGuide: StudyGuide = {
      ...guide,
      createdAt: guide.createdAt || now,
      updatedAt: now
    };

    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery(`
        INSERT INTO study_guides (id, user_id, committee_id, committee_name, topic, file_name, file_size, page_count, raw_text, summary, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          committee_id = EXCLUDED.committee_id,
          committee_name = EXCLUDED.committee_name,
          topic = EXCLUDED.topic,
          file_name = EXCLUDED.file_name,
          file_size = EXCLUDED.file_size,
          page_count = EXCLUDED.page_count,
          raw_text = EXCLUDED.raw_text,
          summary = EXCLUDED.summary,
          updated_at = NOW()
      `, [
        fullGuide.id,
        fullGuide.userId,
        fullGuide.committeeId,
        fullGuide.committeeName,
        fullGuide.topic || null,
        fullGuide.fileName || null,
        fullGuide.fileSize || null,
        fullGuide.pageCount || null,
        fullGuide.rawText || '',
        JSON.stringify(fullGuide.summary || {}),
        fullGuide.createdAt,
        fullGuide.updatedAt
      ]);
      return fullGuide;
    }

    const mem = this.loadMemoryFallback();
    if (!mem.studyGuides) mem.studyGuides = [];
    const idx = mem.studyGuides.findIndex((g: any) => g.id === guide.id);
    if (idx >= 0) {
      mem.studyGuides[idx] = fullGuide;
    } else {
      mem.studyGuides.unshift(fullGuide);
    }
    return fullGuide;
  }

  public async updateStudyGuide(id: string, userId: string, updates: Partial<StudyGuide>): Promise<StudyGuide | null> {
    const existing = await this.getStudyGuide(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: StudyGuide = {
      ...existing,
      ...updates,
      id: existing.id,
      userId: existing.userId,
      summary: updates.summary ? { ...existing.summary, ...updates.summary } : existing.summary,
      updatedAt: now
    };

    if (this.hasPostgres) {
      await executeQuery(`
        UPDATE study_guides
        SET
          committee_id = $1,
          committee_name = $2,
          topic = $3,
          file_name = $4,
          file_size = $5,
          page_count = $6,
          raw_text = $7,
          summary = $8,
          updated_at = NOW()
        WHERE id = $9 AND user_id = $10
      `, [
        updated.committeeId,
        updated.committeeName,
        updated.topic || null,
        updated.fileName || null,
        updated.fileSize || null,
        updated.pageCount || null,
        updated.rawText || '',
        JSON.stringify(updated.summary || {}),
        id,
        userId
      ]);
      return updated;
    }

    const mem = this.loadMemoryFallback();
    if (!mem.studyGuides) mem.studyGuides = [];
    const idx = mem.studyGuides.findIndex((g: any) => g.id === id && g.userId === userId);
    if (idx >= 0) mem.studyGuides[idx] = updated;
    return updated;
  }

  public async deleteStudyGuide(id: string, userId: string): Promise<boolean> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('DELETE FROM study_guides WHERE id = $1 AND user_id = $2', [id, userId]);
      return (res.rowCount || 0) > 0;
    }

    const mem = this.loadMemoryFallback();
    if (!mem.studyGuides) return false;
    const prevLen = mem.studyGuides.length;
    mem.studyGuides = mem.studyGuides.filter((g: any) => !(g.id === id && g.userId === userId));
    return mem.studyGuides.length !== prevLen;
  }

  // --- PARTNERSHIP METHODS ---
  public async getPartnerships(): Promise<any[]> {
    if (this.hasPostgres) {
      await this.ensureInit();
      const res = await executeQuery('SELECT * FROM partnerships ORDER BY created_at DESC');
      return res.rows.map(r => typeof r.data === 'string' ? JSON.parse(r.data) : r.data);
    }
    const mem = this.loadMemoryFallback();
    return mem.partnerships || [];
  }

  public async addPartnership(partner: any): Promise<any> {
    const id = 'ptn_' + Math.random().toString(36).substring(2, 9);
    partner.id = id;
    partner.createdAt = new Date().toISOString();
    partner.referredUsers = 0;
    partner.paidConversions = 0;

    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery(`
        INSERT INTO partnerships (id, affiliate_code, data, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [id, partner.affiliateCode || null, JSON.stringify(partner)]);
      return partner;
    }

    const mem = this.loadMemoryFallback();
    if (!mem.partnerships) mem.partnerships = [];
    mem.partnerships.push(partner);
    return partner;
  }

  public async deletePartnership(id: string): Promise<void> {
    if (this.hasPostgres) {
      await this.ensureInit();
      await executeQuery('DELETE FROM partnerships WHERE id = $1', [id]);
      return;
    }
    const mem = this.loadMemoryFallback();
    if (!mem.partnerships) return;
    mem.partnerships = mem.partnerships.filter((p: any) => p.id !== id);
  }

  // --- HEALTH & MONITORING ---
  public async getHealthStatus(): Promise<{
    status: 'connected' | 'degraded' | 'disconnected';
    databaseConfigured: boolean;
    provider: string;
    latencyMs: number;
    tables: Record<string, number>;
    hostMasked?: string;
    databaseName?: string;
    serverTimestamp?: string;
    pgVersion?: string;
    error?: string;
  }> {
    const connStr = process.env.DATABASE_URL?.trim();
    if (!connStr) {
      const mem = this.loadMemoryFallback();
      return {
        status: 'disconnected',
        databaseConfigured: false,
        provider: 'In-Memory Fallback (Local Memory)',
        latencyMs: 0,
        tables: {
          users: (mem.users || []).length,
          position_papers: (mem.positionPapers || []).length,
          speeches: (mem.speeches || []).length,
          resolutions: (mem.resolutions || []).length,
          study_guides: (mem.studyGuides || []).length,
          partnerships: (mem.partnerships || []).length,
        },
        error: 'DATABASE_URL environment variable is not configured. Falling back to in-memory state.'
      };
    }

    // Mask the host safely
    let hostMasked = 'configured';
    let databaseName = 'database';
    try {
      const parsed = new URL(connStr);
      const hostParts = parsed.hostname.split('.');
      if (hostParts.length >= 2) {
        hostMasked = `${hostParts[0].slice(0, 4)}***.${hostParts.slice(-2).join('.')}`;
      } else {
        hostMasked = parsed.hostname;
      }
      databaseName = parsed.pathname.replace(/^\//, '') || 'postgres';
    } catch {}

    const startTime = Date.now();
    try {
      await this.ensureInit();
      const pingRes = await executeQuery('SELECT NOW() as now, version() as version');
      const latencyMs = Date.now() - startTime;

      const tablesList = [
        'users',
        'position_papers',
        'speeches',
        'resolutions',
        'study_guides',
        'partnerships',
        'user_tokens',
        'usage_records'
      ];

      const tables: Record<string, number> = {};
      for (const tbl of tablesList) {
        try {
          const countRes = await executeQuery(`SELECT COUNT(*)::int as count FROM ${tbl}`);
          tables[tbl] = countRes.rows[0]?.count ?? 0;
        } catch {
          tables[tbl] = 0;
        }
      }

      const isNeon = connStr.includes('neon.tech') || connStr.includes('neon');

      return {
        status: 'connected',
        databaseConfigured: true,
        provider: isNeon ? 'PostgreSQL (Neon Serverless)' : 'PostgreSQL',
        latencyMs,
        tables,
        hostMasked,
        databaseName,
        serverTimestamp: pingRes.rows[0]?.now ? new Date(pingRes.rows[0].now).toISOString() : new Date().toISOString(),
        pgVersion: pingRes.rows[0]?.version ? String(pingRes.rows[0].version).split(' ')[0] + ' ' + String(pingRes.rows[0].version).split(' ')[1] : undefined
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const mem = this.loadMemoryFallback();
      return {
        status: 'disconnected',
        databaseConfigured: true,
        provider: connStr.includes('neon') ? 'PostgreSQL (Neon Serverless)' : 'PostgreSQL',
        latencyMs,
        tables: {
          users: (mem.users || []).length,
          position_papers: (mem.positionPapers || []).length,
          speeches: (mem.speeches || []).length,
          resolutions: (mem.resolutions || []).length,
          study_guides: (mem.studyGuides || []).length,
          partnerships: (mem.partnerships || []).length,
        },
        hostMasked,
        databaseName,
        error: err.message || 'Database connection error'
      };
    }
  }
}

export const db = new DBManager();
