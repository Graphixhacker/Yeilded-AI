import { User, PositionPaperDraft, SpeechDraft, ResolutionDraft, CrisisNote, Currency, StudyGuide } from '../types';

const TOKEN_STORAGE_KEY = 'mun_auth_token';
const CONTEXT_STORAGE_KEY = 'mun_delegate_context';
const CURRENCY_STORAGE_KEY = 'mun_currency';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  try {
    localStorage.removeItem('mun_user');
  } catch {}
}

export function detectUserCurrency(): Currency {
  const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (saved === 'PKR' || saved === 'USD') return saved;

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = navigator.language || '';
    if (tz.includes('Karachi') || lang.includes('PK') || lang.startsWith('ur')) {
      return 'PKR';
    }
  } catch {
    // fallback
  }
  return 'USD';
}

export function saveUserCurrency(curr: Currency): void {
  localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
}

export async function request(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });
  } catch (netErr: any) {
    throw {
      status: 0,
      message: 'Network error: Unable to connect to server. Please check your connection.',
      code: 'NETWORK_ERROR'
    };
  }

  let data: any = {};
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message = data.error || data.message || (
      res.status === 401 ? 'Invalid email or password' :
      res.status === 409 ? 'An account with this email already exists' :
      res.status === 403 ? (data.error || 'Access restricted') :
      res.status === 400 ? (data.error || 'Invalid request details') :
      res.status === 404 ? 'Resource not found' :
      res.status >= 500 ? 'Server temporarily unavailable. Please try again.' :
      'Server request failed'
    );
    throw {
      status: res.status,
      message,
      code: data.code,
      isFreeTierLimit: data.isFreeTierLimit,
      isChatLimitReached: data.isChatLimitReached,
      requireAuth: data.requireAuth,
      remaining: data.remaining
    };
  }

  return data;
}

export const api = {
  // Auth
  async login(email: string, pass: string) {
    const cleanEmail = email.trim().toLowerCase();
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password: pass })
    });
    if (data.token) setStoredToken(data.token);
    if (data.user) {
      try {
        localStorage.setItem('mun_user', JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },

  async demoLogin() {
    const data = await request('/auth/demo', {
      method: 'POST'
    });
    if (data.token) setStoredToken(data.token);
    if (data.user) {
      try {
        localStorage.setItem('mun_user', JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },

  async register(email: string, name: string, pass: string, affiliateCode?: string) {
    const cleanEmail = email.trim().toLowerCase();
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, name: name.trim(), password: pass, affiliateCode })
    });
    if (data.token) setStoredToken(data.token);
    if (data.user) {
      try {
        localStorage.setItem('mun_user', JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },

  async forgotPassword(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    return await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail })
    });
  },

  async validateResetToken(token: string) {
    const cleanToken = encodeURIComponent(token.trim());
    return await request(`/auth/validate-reset-token?token=${cleanToken}`, {
      method: 'GET'
    });
  },

  async resetPassword(token: string, password: string) {
    return await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: token.trim(), password })
    });
  },

  async googleLogin(email?: string, name?: string, avatar?: string, credential?: string) {
    const data = await request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name, avatar, credential })
    });
    if (data.token) setStoredToken(data.token);
    if (data.user) {
      try {
        localStorage.setItem('mun_user', JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },

  async updateProfile(name: string): Promise<{ user: User }> {
    const data = await request('/user/profile', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    if (data.user) {
      try {
        localStorage.setItem('mun_user', JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },
  async getMe(): Promise<{ user: User }> {
    return request('/auth/me');
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return request('/auth/me');
  },

  async detectCurrency(): Promise<Currency> {
    return detectUserCurrency();
  },

  logout(): void {
    clearStoredToken();
  },

  // Subscription / Passes
  async activatePass(tier: '1week' | 'monthly', paymentMethod: string, currency: Currency, amount: number): Promise<{ user: User; success: boolean }> {
    return request('/user/subscription', {
      method: 'POST',
      body: JSON.stringify({ tier, paymentMethod, currency, amount })
    });
  },

  // Drafts
  async getDrafts(): Promise<{ papers: PositionPaperDraft[]; speeches: SpeechDraft[]; resolutions: ResolutionDraft[] }> {
    return request('/drafts');
  },

  async getPapers(): Promise<{ papers: PositionPaperDraft[] }> {
    const res = await request('/drafts');
    return { papers: res.papers || [] };
  },

  async getSpeeches(): Promise<{ speeches: SpeechDraft[] }> {
    const res = await request('/drafts');
    return { speeches: res.speeches || [] };
  },

  async savePaper(paper: Partial<PositionPaperDraft>): Promise<{ paper: PositionPaperDraft }> {
    return request('/drafts/paper', {
      method: 'POST',
      body: JSON.stringify(paper)
    });
  },

  async saveSpeech(speech: Partial<SpeechDraft>): Promise<{ speech: SpeechDraft }> {
    return request('/drafts/speech', {
      method: 'POST',
      body: JSON.stringify(speech)
    });
  },

  // AI Generation
  async generateAI(feature: string, payload: any): Promise<any> {
    return request('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ feature, payload })
    });
  },

  // AI Chat
  async chat(messages: { role: string; content: string }[]): Promise<{ reply: string; remaining: number | 'unlimited'; count?: number }> {
    return request('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages })
    });
  },

  async getChatUsage(): Promise<{ remaining: number | 'unlimited'; count: number; limit: number | 'unlimited'; isFree: boolean; isChatLimitReached: boolean }> {
    return request('/chat/usage');
  },

  // Study Guides
  async getStudyGuides(): Promise<{ guides: StudyGuide[]; limit: number; currentCount: number; canAdd: boolean; tier: string }> {
    return request('/study-guides');
  },

  async getStudyGuideForCommittee(committee: string): Promise<{ guide: StudyGuide | null }> {
    return request(`/study-guides/for-committee?committee=${encodeURIComponent(committee)}`);
  },

  async uploadStudyGuide(data: {
    committeeId: string;
    committeeName: string;
    topic?: string;
    inputType: 'pdf' | 'text';
    pdfBase64?: string;
    text?: string;
    fileName?: string;
    fileSize?: number;
  }): Promise<{ guide: StudyGuide; guides: StudyGuide[]; limit: number; currentCount: number; canAdd: boolean; message: string }> {
    return request('/study-guides', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateStudyGuide(id: string, data: { summary?: any; topic?: string; committeeName?: string }): Promise<{ guide: StudyGuide; message: string }> {
    return request(`/study-guides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteStudyGuide(id: string): Promise<{ success: boolean; guides: StudyGuide[]; limit: number; currentCount: number; canAdd: boolean }> {
    return request(`/study-guides/${id}`, {
      method: 'DELETE'
    });
  }
};
