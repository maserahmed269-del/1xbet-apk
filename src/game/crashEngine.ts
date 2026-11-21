export type CrashPhase = 'countdown' | 'flying' | 'crashed';

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

const GROWTH_RATE = 0.145;

export function generateCrashPoint(rng: () => number = Math.random): number {
  const r = Math.min(0.9999, Math.max(0.0001, rng()));
  if (r < 0.04) {
    return Math.round((1.15 + (r / 0.04) * 0.2) * 100) / 100;
  }
  const raw = 0.96 / (1 - r);
  const clamped = Math.min(25, Math.max(1.25, raw));
  return Math.round(clamped * 100) / 100;
}

export function calculateMultiplier(elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 1.0;
  const val = Math.exp(GROWTH_RATE * elapsedSeconds);
  return Math.round(val * 100) / 100;
}

export function calculateElapsedForMultiplier(multiplier: number): number {
  if (multiplier <= 1) return 0;
  return Math.log(multiplier) / GROWTH_RATE;
}

export function calculatePayout(betAmount: number, multiplier: number): number {
  if (!Number.isFinite(betAmount) || !Number.isFinite(multiplier) || betAmount <= 0 || multiplier < 1) {
    return 0;
  }
  return Math.round(betAmount * multiplier * 100) / 100;
}

export function validateBet(betAmount: number, balance: number): ValidationResult {
  if (!Number.isFinite(betAmount) || betAmount <= 0) {
    return { ok: false, error: 'أدخل مبلغ رهان صحيح أكبر من صفر' };
  }
  if (betAmount < 1) {
    return { ok: false, error: 'الحد الأدنى للرهان هو 1 ج.م' };
  }
  if (betAmount > balance) {
    return { ok: false, error: 'رصيدك الحالي غير كافٍ — قم بعمل إيداع أولاً' };
  }
  return { ok: true };
}

export function validateDeposit(amount: number, hasScreenshot: boolean): ValidationResult {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'أدخل مبلغ إيداع صحيح' };
  }
  if (amount < 150) {
    return { ok: false, error: 'الحد الأدنى للإيداع 150 ج.م' };
  }
  if (amount > 100000) {
    return { ok: false, error: 'الحد الأقصى للإيداع 100,000 ج.م' };
  }
  if (!hasScreenshot) {
    return { ok: false, error: 'يرجى إرفاق اسكرين التحويل أو الضغط على اسكرين تجريبي سريع' };
  }
  return { ok: true };
}

export function validateWithdraw(amount: number, balance: number, account: string): ValidationResult {
  if (!account || account.trim().length < 6) {
    return { ok: false, error: 'أدخل رقم محفظة صحيح' };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'أدخل مبلغ سحب صحيح' };
  }
  if (amount < 50) {
    return { ok: false, error: 'الحد الأدنى للسحب 50 ج.م' };
  }
  if (amount > balance) {
    return { ok: false, error: 'رصيدك غير كافٍ لإتمام السحب' };
  }
  return { ok: true };
}

export function formatEGP(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${safe.toFixed(2)} ج.م`;
}
