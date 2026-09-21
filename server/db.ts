import fs from 'fs';
import path from 'path';
import type { User, PositionPaperDraft, SpeechDraft, ResolutionDraft, CrisisNote, StudyGuide } from '../src/types/index.ts';

interface UsageLog {
  id: string;
  userId: string;
  feature: string;
  timestamp: number;
  date: string;
}

export interface PasswordResetToken {
  tokenHash: string;
  userId: string;
  expiresAt: number;
  used: boolean;
  createdAt: number;
}

interface DatabaseSchema {
  users: Record<string, User>;
  passwords: Record<string, string>; // userId -> password (simple hash/plaintext for demo)
  tokens: Record<string, string>; // token -> userId
  passwordResetTokens?: PasswordResetToken[];
  positionPapers: PositionPaperDraft[];
  speeches: SpeechDraft[];
  resolutions: ResolutionDraft[];
  crisisNotes: CrisisNote[];
  studyGuides?: StudyGuide[];
  usageLogs: UsageLog[];
  partnerships: any[];
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const SEED_DIR = path.resolve(process.cwd(), 'data');
const SEED_DB_PATH = path.join(SEED_DIR, 'mun_database.json');

const DB_DIR = isServerless ? path.join('/tmp', 'data') : SEED_DIR;
const DB_PATH = path.join(DB_DIR, 'mun_database.json');

const INITIAL_DB: DatabaseSchema = {
  users: {
    'demo-delegate-1': {
      id: 'demo-delegate-1',
      email: 'delegate@modelun.org',
      name: 'Ambassador Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      tier: 'free',
      passExpiresAt: null,
      generationsUsed: 1,
      dailyGenerations: {
        date: new Date().toISOString().slice(0, 10),
        count: 1
      },
      createdAt: new Date().toISOString()
    }
  },
  passwords: {
    'demo-delegate-1': 'diplomat2025'
  },
  tokens: {
    'tok_demo_delegate_1': 'demo-delegate-1'
  },
  passwordResetTokens: [],
  positionPapers: [],
  speeches: [],
  resolutions: [],
  crisisNotes: [],
  studyGuides: [],
  usageLogs: [],
  partnerships: []
};

class DBManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return { ...INITIAL_DB, ...JSON.parse(raw) };
      }
      if (fs.existsSync(SEED_DB_PATH)) {
        const raw = fs.readFileSync(SEED_DB_PATH, 'utf-8');
        const parsed = { ...INITIAL_DB, ...JSON.parse(raw) };
        if (isServerless) {
          try {
            if (!fs.existsSync(DB_DIR)) {
              fs.mkdirSync(DB_DIR, { recursive: true });
            }
            fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
          } catch {}
        }
        return parsed;
      }
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
    } catch (err) {
      console.error('[DB] Failed to load DB file, using memory fallback:', err);
    }
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }


  private saveTimeout: NodeJS.Timeout | null = null;
  private save(): void {
    if (isServerless) {
      try {
        if (!fs.existsSync(DB_DIR)) {
          fs.mkdirSync(DB_DIR, { recursive: true });
        }
        fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.warn('[DB] Warning: could not persist DB to filesystem in serverless:', err);
      }
      return;
    }

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        if (!fs.existsSync(DB_DIR)) {
          fs.mkdirSync(DB_DIR, { recursive: true });
        }
        fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8', (err) => {
          if (err) console.error('[DB] Failed to async save DB file:', err);
        });
      } catch (err) {
        console.error('[DB] Failed to initiate save DB file:', err);
      }
    }, 1000);
  }


  
  

  public getAllUsers(): User[] {
    return Object.values(this.data.users);
  }

  public setUserBanned(userId: string, banned: boolean): User | undefined {
    const user = this.getUser(userId);
    if (user) {
      (user as any).banned = banned;
      this.save();
    }
    return user;
  }

  public getPartnerships() {
    return this.data.partnerships || [];
  }

  public addPartnership(partner: any) {
    const id = 'ptn_' + Math.random().toString(36).substring(2, 9);
    partner.id = id;
    partner.createdAt = new Date().toISOString();
    partner.referredUsers = 0;
    partner.paidConversions = 0;
    if (!this.data.partnerships) this.data.partnerships = [];
    this.data.partnerships.push(partner);
    this.save();
    return partner;
  }

    public deletePartnership(id: string) {
    if (!this.data.partnerships) return;
    this.data.partnerships = this.data.partnerships.filter(p => p.id !== id);
    this.save();
  }

  public getUser(userId: string): User | undefined {
    const user = this.data.users[userId];
    if (user) {
      // Check if 1-week or monthly pass has expired
      if (user.passExpiresAt && Date.now() > user.passExpiresAt) {
        user.tier = 'free';
        user.passExpiresAt = null;
        this.save();
      }
    }
    return user;
  }

  public getUserByEmail(email: string): User | undefined {
    const cleanEmail = email.trim().toLowerCase();
    return Object.values(this.data.users).find(
      u => u.email.trim().toLowerCase() === cleanEmail
    );
  }

  public getUserByToken(token: string): User | undefined {
    const userId = this.data.tokens[token];
    return userId ? this.getUser(userId) : undefined;
  }

  public createUser(email: string, name: string, passwordHash: string, affiliateCode?: string): { user: User; token: string } {
    const cleanEmail = email.trim().toLowerCase();
    const id = 'user_' + Math.random().toString(36).substring(2, 9) + Date.now();
    const newUser: User = {
      id,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      tier: 'free',
      passExpiresAt: null,
      generationsUsed: 0,
      dailyGenerations: {
        date: new Date().toISOString().slice(0, 10),
        count: 0
      },
      createdAt: new Date().toISOString()
    };
    const token = 'tok_' + Math.random().toString(36).substring(2, 15) + Date.now();

    this.data.users[id] = newUser;
    this.data.passwords[id] = passwordHash;
    this.data.tokens[token] = id;

    if (affiliateCode) {
      (newUser as any).affiliateCode = affiliateCode;
      
      const partners = this.getPartnerships();
      const partner = partners.find(p => p.affiliateCode === affiliateCode);
      if (partner) {
        partner.referredUsers = (partner.referredUsers || 0) + 1;
      }
    }

    this.save();
    return { user: newUser, token };
  }

  public ensureDemoDelegate(): { user: User; token: string } {
    let demoUser = this.getUserByEmail('delegate@modelun.org');
    if (!demoUser) {
      return this.createUser('delegate@modelun.org', 'Ambassador Alex Chen', 'diplomat2025');
    }
    const token = this.createTokenForUser(demoUser.id);
    return { user: demoUser, token };
  }

  public verifyPassword(userId: string, pass: string): boolean {
    return this.data.passwords[userId] === pass;
  }

  public savePasswordResetToken(resetToken: PasswordResetToken): void {
    if (!this.data.passwordResetTokens) {
      this.data.passwordResetTokens = [];
    }
    this.data.passwordResetTokens.push(resetToken);
    this.save();
  }

  public getPasswordResetToken(tokenHash: string): PasswordResetToken | undefined {
    if (!this.data.passwordResetTokens) return undefined;
    return this.data.passwordResetTokens.find(t => t.tokenHash === tokenHash);
  }

  public markPasswordResetTokenUsed(tokenHash: string): void {
    if (!this.data.passwordResetTokens) return;
    const record = this.data.passwordResetTokens.find(t => t.tokenHash === tokenHash);
    if (record) {
      record.used = true;
      this.save();
    }
  }

  public invalidateUserSessions(userId: string): void {
    if (!this.data.tokens) return;
    for (const [token, uid] of Object.entries(this.data.tokens)) {
      if (uid === userId) {
        delete this.data.tokens[token];
      }
    }
    this.save();
  }

  public updateUserPassword(userId: string, newPassword: string): boolean {
    const user = this.getUser(userId);
    if (!user) return false;
    this.data.passwords[userId] = newPassword;
    // Invalidate old active sessions so user must log in with new password
    this.invalidateUserSessions(userId);
    this.save();
    return true;
  }

  public createTokenForUser(userId: string): string {
    const token = 'tok_' + Math.random().toString(36).substring(2, 15) + Date.now();
    this.data.tokens[token] = userId;
    this.save();
    return token;
  }

  
  public updateUserProfile(userId: string, name: string): User {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');
    user.name = name;
    this.save();
    return user;
  }

  public updateUserTier(userId: string, tier: 'free' | '1week' | 'monthly'): User {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');

    const now = Date.now();
    let expiresAt: number | null = null;

    if (tier === '1week') {
      expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days
    } else if (tier === 'monthly') {
      expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    user.tier = tier;
    user.passExpiresAt = expiresAt;
    this.save();
    return user;
  }

  public checkAndIncrementUsage(userId: string, feature: string): { allowed: boolean; reason?: string } {
    const user = this.getUser(userId);
    if (!user) return { allowed: false, reason: 'User not authenticated' };

    const today = new Date().toISOString().slice(0, 10);
    if (user.dailyGenerations.date !== today) {
      user.dailyGenerations = { date: today, count: 0 };
    }

    // Rate limit: 50 requests per day across all tiers to prevent abuse
    if (user.dailyGenerations.count >= 50) {
      return { allowed: false, reason: 'Daily cap reached (50 generations/day). Resets tomorrow.' };
    }

    // Free tier checks
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

    // Increment usage
    user.dailyGenerations.count += 1;
    if (isHeavyFeature) {
      user.generationsUsed += 1;
    }

    this.data.usageLogs.push({
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      userId,
      feature,
      timestamp: Date.now(),
      date: today
    });

    this.save();
    return { allowed: true };
  }

  public checkAndIncrementChatUsage(userId?: string): { allowed: boolean; reason?: string; isChatLimitReached?: boolean; requireAuth?: boolean; remaining: number | 'unlimited'; count: number } {
    if (!userId) {
      return {
        allowed: false,
        reason: 'Please sign in or create an account to use AI Chat (5 free messages per day).',
        requireAuth: true,
        remaining: 0,
        count: 0
      };
    }

    const user = this.getUser(userId);
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
      this.save();
      return {
        allowed: true,
        remaining: 'unlimited',
        count: user.chatUsage.count
      };
    }

    // Free tier: 5 messages per day
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
    this.save();
    return {
      allowed: true,
      remaining: Math.max(0, FREE_CHAT_DAILY_LIMIT - user.chatUsage.count),
      count: user.chatUsage.count
    };
  }

  public getChatUsage(userId?: string): { remaining: number | 'unlimited'; count: number; limit: number | 'unlimited'; isFree: boolean; isChatLimitReached: boolean } {
    if (!userId) {
      return { remaining: 0, count: 0, limit: 5, isFree: true, isChatLimitReached: false };
    }
    const user = this.getUser(userId);
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

  // Draft operations
  public savePositionPaper(draft: PositionPaperDraft): PositionPaperDraft {
    const idx = this.data.positionPapers.findIndex(p => p.id === draft.id);
    if (idx >= 0) {
      this.data.positionPapers[idx] = draft;
    } else {
      this.data.positionPapers.unshift(draft);
    }
    this.save();
    return draft;
  }

  public getPositionPapers(userId: string): PositionPaperDraft[] {
    return this.data.positionPapers.filter(p => p.userId === userId);
  }

  public deletePositionPaper(id: string, userId: string): boolean {
    const prevLen = this.data.positionPapers.length;
    this.data.positionPapers = this.data.positionPapers.filter(p => !(p.id === id && p.userId === userId));
    if (this.data.positionPapers.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  public saveSpeech(draft: SpeechDraft): SpeechDraft {
    const idx = this.data.speeches.findIndex(s => s.id === draft.id);
    if (idx >= 0) {
      this.data.speeches[idx] = draft;
    } else {
      this.data.speeches.unshift(draft);
    }
    this.save();
    return draft;
  }

  public getSpeeches(userId: string): SpeechDraft[] {
    return this.data.speeches.filter(s => s.userId === userId);
  }

  public saveResolution(draft: ResolutionDraft): ResolutionDraft {
    const idx = this.data.resolutions.findIndex(r => r.id === draft.id);
    if (idx >= 0) {
      this.data.resolutions[idx] = draft;
    } else {
      this.data.resolutions.unshift(draft);
    }
    this.save();
    return draft;
  }

  public getResolutions(userId: string): ResolutionDraft[] {
    return this.data.resolutions.filter(r => r.userId === userId);
  }

  // Study Guide operations
  public getStudyGuides(userId: string): StudyGuide[] {
    const list = this.data.studyGuides || [];
    return list.filter(g => g.userId === userId);
  }

  public getStudyGuide(id: string, userId: string): StudyGuide | undefined {
    const list = this.data.studyGuides || [];
    return list.find(g => g.id === id && g.userId === userId);
  }

  public findStudyGuideForCommittee(userId: string, committeeIdOrName: string): StudyGuide | undefined {
    if (!committeeIdOrName || !committeeIdOrName.trim()) return undefined;
    const userGuides = this.getStudyGuides(userId);
    if (userGuides.length === 0) return undefined;

    const query = committeeIdOrName.trim().toLowerCase();

    // 1. Exact match on committeeId or committeeName
    const exact = userGuides.find(g => 
      g.committeeId.toLowerCase() === query || 
      g.committeeName.toLowerCase() === query
    );
    if (exact) return exact;

    // 2. Substring matching (e.g., 'UNSC' inside 'United Nations Security Council (UNSC)')
    const substring = userGuides.find(g => {
      const cId = g.committeeId.toLowerCase();
      const cName = g.committeeName.toLowerCase();
      return query.includes(cId) || query.includes(cName) || cId.includes(query) || cName.includes(query);
    });

    return substring;
  }

  public canAddStudyGuide(userId: string): { allowed: boolean; limit: number; currentCount: number; reason?: string } {
    const user = this.getUser(userId);
    const isPaid = user?.tier === '1week' || user?.tier === 'monthly';
    const limit = isPaid ? 5 : 1;
    const currentCount = this.getStudyGuides(userId).length;

    if (currentCount >= limit) {
      const reason = isPaid
        ? `You have reached the maximum of 5 study guides for your Conference Pass.`
        : `Free tier allows 1 study guide. Upgrade to a Conference Pass to upload up to 5 study guides.`;
      return { allowed: false, limit, currentCount, reason };
    }

    return { allowed: true, limit, currentCount };
  }

  public saveStudyGuide(guide: StudyGuide): StudyGuide {
    if (!this.data.studyGuides) {
      this.data.studyGuides = [];
    }

    // Check if updating existing by id, or same committee for this user
    const idx = this.data.studyGuides.findIndex(g => g.id === guide.id);
    if (idx >= 0) {
      this.data.studyGuides[idx] = { ...this.data.studyGuides[idx], ...guide, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.studyGuides[idx];
    }

    this.data.studyGuides.unshift(guide);
    this.save();
    return guide;
  }

  public updateStudyGuide(id: string, userId: string, updates: Partial<StudyGuide>): StudyGuide | null {
    if (!this.data.studyGuides) this.data.studyGuides = [];
    const idx = this.data.studyGuides.findIndex(g => g.id === id && g.userId === userId);
    if (idx < 0) return null;

    const existing = this.data.studyGuides[idx];
    const updated: StudyGuide = {
      ...existing,
      ...updates,
      id: existing.id,
      userId: existing.userId,
      summary: updates.summary ? { ...existing.summary, ...updates.summary } : existing.summary,
      updatedAt: new Date().toISOString()
    };
    this.data.studyGuides[idx] = updated;
    this.save();
    return updated;
  }

  public deleteStudyGuide(id: string, userId: string): boolean {
    if (!this.data.studyGuides) return false;
    const prevLen = this.data.studyGuides.length;
    this.data.studyGuides = this.data.studyGuides.filter(g => !(g.id === id && g.userId === userId));
    if (this.data.studyGuides.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new DBManager();
