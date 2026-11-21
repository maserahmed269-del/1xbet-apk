import React, { useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { formatEGP, validateDeposit, validateWithdraw } from '../game/crashEngine';

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  method: string;
  account?: string;
  timestamp: string;
}

const PAYMENT_METHODS = [
  {
    id: 'vodafone',
    name: 'فودافون كاش',
    badge: 'V',
    number: '01050162971',
    circleBg: 'bg-red-600',
    activeCard: 'border-red-500 bg-red-50/70',
    textColor: 'text-red-600',
  },
  {
    id: 'etisalat',
    name: 'اتصالات كاش',
    badge: 'e',
    number: '01050162971',
    circleBg: 'bg-emerald-600',
    activeCard: 'border-emerald-500 bg-emerald-50/70',
    textColor: 'text-emerald-600',
  },
  {
    id: 'orange',
    name: 'اورنج كاش',
    badge: 'O',
    number: '01050162971',
    circleBg: 'bg-orange-500',
    activeCard: 'border-orange-500 bg-orange-50/70',
    textColor: 'text-orange-600',
  },
] as const;

const DEPOSIT_PRESETS = [150, 200, 500, 1000];

interface DepositScreenProps {
  balance: number;
  transactions: WalletTransaction[];
  onBack: () => void;
  onDeposit: (amount: number, method: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DepositScreen: React.FC<DepositScreenProps> = ({
  onBack,
  onDeposit,
  onShowToast,
}) => {
  const [selectedId, setSelectedId] = useState<'vodafone' | 'etisalat' | 'orange'>('vodafone');
  const [amountInput, setAmountInput] = useState('200');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedId) ?? PAYMENT_METHODS[0];

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(selectedMethod.number);
    } catch {
      // clipboard fallback ignored in headless context
    }
    onShowToast(`تم نسخ الرقم ${selectedMethod.number}`, 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDemoReceipt = () => {
    setReceiptName('demo-receipt.png');
    setReceiptPreview('demo');
    onShowToast('تم إرفاق اسكرين تجريبي بنجاح', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amountInput);
    const check = validateDeposit(num, Boolean(receiptPreview));
    if (!check.ok) {
      onShowToast(check.error || 'يرجى مراجعة بيانات الإيداع', 'error');
      return;
    }
    onDeposit(num, selectedMethod.name);
    onShowToast(`تم إيداع ${formatEGP(num)} في حسابك بنجاح`, 'success');
    onBack();
  };

  return (
    <section id="screen-deposit" className="flex-1 flex flex-col bg-slate-100 text-slate-900 overflow-y-auto no-scrollbar">
      <header className="bg-[#162230] text-white px-3 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-20">
        <button
          type="button"
          onClick={onBack}
          aria-label="رجوع"
          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-black text-white">إيداع الرصيد</h2>
        <div className="w-8" />
      </header>

      <div className="p-3.5 flex-1">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4"
        >
          <div>
            <div className="text-xs font-extrabold text-slate-700 mb-2">وسيلة الدفع:</div>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const isSelected = m.id === selectedId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    className={`rounded-xl border-2 py-2.5 px-1.5 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? m.activeCard
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full ${m.circleBg} text-white font-black text-sm flex items-center justify-center shadow-xs`}
                    >
                      {m.badge}
                    </span>
                    <span className="text-[11px] font-black text-slate-800 text-center leading-tight">
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-600">حول المبلغ إلى هذا الرقم:</span>
              <span className={`font-black ${selectedMethod.textColor}`}>{selectedMethod.name}</span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-base font-black text-slate-900 tracking-wide tabular-nums" dir="ltr">
                {selectedMethod.number}
              </span>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="bg-[#1D69A6] hover:bg-[#175587] text-white text-xs font-black px-3.5 py-2 rounded-lg transition cursor-pointer shrink-0"
              >
                نسخ الرقم
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="deposit-amount" className="text-xs font-extrabold text-slate-700">
                مبلغ الإيداع (ج.م):
              </label>
              <span className="text-[11px] font-extrabold text-amber-600">
                الحد الأدنى للإيداع 150 ج.م
              </span>
            </div>

            <input
              id="deposit-amount"
              type="number"
              min="150"
              step="10"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#1D69A6] rounded-xl px-4 py-2.5 text-center text-lg font-black text-slate-900 outline-none tabular-nums"
            />

            <div className="grid grid-cols-4 gap-2">
              {DEPOSIT_PRESETS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmountInput(String(val))}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg py-1.5 text-xs font-black text-slate-700 cursor-pointer tabular-nums"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-slate-700">
                إرفاق اسكرين التحويل (صورة إيصال)
              </span>
              <button
                type="button"
                onClick={handleDemoReceipt}
                className="text-[11px] font-black text-[#1D69A6] hover:underline cursor-pointer shrink-0"
              >
                + اسكرين تجريبي سريع
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 hover:border-[#1D69A6] bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {receiptPreview ? (
                <>
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  <span className="text-xs font-black text-emerald-700">
                    تم إرفاق الإيصال ({receiptName})
                  </span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-7 h-7 text-slate-400" />
                  <span className="text-xs font-extrabold text-slate-600">
                    اضغط هنا لاختيار صورة اسكرين التحويل
                  </span>
                  <span className="text-[10px] font-bold text-slate-400" dir="ltr">
                    PNG, JPG, JPEG
                  </span>
                </>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4CAF50] hover:bg-[#43A047] active:scale-[0.99] text-white font-black text-sm py-3.5 rounded-xl shadow-md transition cursor-pointer"
          >
            تأكيد الإيداع
          </button>
        </form>
      </div>
    </section>
  );
};

interface WithdrawScreenProps {
  balance: number;
  transactions: WalletTransaction[];
  onBack: () => void;
  onWithdraw: (amount: number, method: string, account: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WithdrawScreen: React.FC<WithdrawScreenProps> = ({
  balance,
  onBack,
  onWithdraw,
  onShowToast,
}) => {
  const [selectedId, setSelectedId] = useState<'vodafone' | 'etisalat' | 'orange'>('vodafone');
  const [account, setAccount] = useState('');
  const [amountInput, setAmountInput] = useState('100');

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedId) ?? PAYMENT_METHODS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amountInput);
    const check = validateWithdraw(num, balance, account);
    if (!check.ok) {
      onShowToast(check.error || 'تعذر إتمام السحب', 'error');
      return;
    }
    onWithdraw(num, selectedMethod.name, account.trim());
    onShowToast(`تم إرسال طلب سحب ${formatEGP(num)} بنجاح`, 'success');
    onBack();
  };

  return (
    <section id="screen-withdraw" className="flex-1 flex flex-col bg-slate-100 text-slate-900 overflow-y-auto no-scrollbar">
      <header className="bg-[#162230] text-white px-3 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-20">
        <button
          type="button"
          onClick={onBack}
          aria-label="رجوع"
          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-black text-white">سحب الأرباح</h2>
        <div className="w-8" />
      </header>

      <div className="p-3.5 flex-1">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4"
        >
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600">الرصيد المتاح للسحب:</span>
            <span className="text-sm font-black text-emerald-700 tabular-nums">{formatEGP(balance)}</span>
          </div>

          <div>
            <div className="text-xs font-extrabold text-slate-700 mb-2">وسيلة السحب:</div>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const isSelected = m.id === selectedId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    className={`rounded-xl border-2 py-2.5 px-1.5 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? m.activeCard
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full ${m.circleBg} text-white font-black text-sm flex items-center justify-center`}
                    >
                      {m.badge}
                    </span>
                    <span className="text-[11px] font-black text-slate-800 text-center leading-tight">
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="withdraw-account" className="block text-xs font-extrabold text-slate-700 mb-1.5">
              رقم المحفظة المستلمة:
            </label>
            <input
              id="withdraw-account"
              type="tel"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="010xxxxxxxx"
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#1D69A6] rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="withdraw-amount" className="text-xs font-extrabold text-slate-700">
                مبلغ السحب (ج.م):
              </label>
              <span className="text-[11px] font-extrabold text-slate-500">الحد الأدنى 50 ج.م</span>
            </div>
            <input
              id="withdraw-amount"
              type="number"
              min="50"
              step="10"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#1D69A6] rounded-xl px-4 py-2.5 text-center text-lg font-black text-slate-900 outline-none tabular-nums"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1D69A6] hover:bg-[#175587] active:scale-[0.99] text-white font-black text-sm py-3.5 rounded-xl shadow-md transition cursor-pointer"
          >
            تأكيد السحب
          </button>
        </form>
      </div>
    </section>
  );
};
