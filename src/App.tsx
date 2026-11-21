import { useCallback, useEffect, useState } from 'react';
import { LoginScreen, SignupScreen } from './components/AuthScreens';
import { CrashGameScreen } from './components/CrashGameScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { DepositScreen, WalletTransaction, WithdrawScreen } from './components/WalletScreens';

type ScreenId = 'login' | 'signup' | 'lobby' | 'crash' | 'deposit' | 'withdraw';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

const STORAGE_BALANCE_KEY = '1xbet_edu_balance_v2';
const STORAGE_TX_KEY = '1xbet_edu_transactions_v2';
const INITIAL_DEMO_BALANCE = 0;

function readInitialBalance(): number {
  try {
    const raw = localStorage.getItem(STORAGE_BALANCE_KEY);
    if (raw !== null) {
      const n = Number(raw);
      if (Number.isFinite(n) && n >= 0) return n;
    }
  } catch {
    // ignore storage errors
  }
  return INITIAL_DEMO_BALANCE;
}

function readInitialTransactions(): WalletTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_TX_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return 'lobby';
    return 'login';
  });

  const [balance, setBalance] = useState<number>(readInitialBalance);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(readInitialTransactions);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BALANCE_KEY, balance.toFixed(2));
    } catch {
      // ignore
    }
  }, [balance]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TX_KEY, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  useEffect(() => {
    document.body.dataset.screen = screen;
  }, [screen]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  const handleBalanceDelta = useCallback((delta: number) => {
    setBalance((prev) => Math.max(0, Math.round((prev + delta) * 100) / 100));
  }, []);

  const handleDeposit = useCallback((amount: number, method: string) => {
    setBalance((prev) => Math.round((prev + amount) * 100) / 100);
    const tx: WalletTransaction = {
      id: `${Date.now()}`,
      type: 'deposit',
      amount,
      method,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setTransactions((prev) => [tx, ...prev.slice(0, 14)]);
  }, []);

  const handleWithdraw = useCallback((amount: number, method: string, account: string) => {
    setBalance((prev) => Math.max(0, Math.round((prev - amount) * 100) / 100));
    const tx: WalletTransaction = {
      id: `${Date.now()}`,
      type: 'withdraw',
      amount,
      method,
      account,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setTransactions((prev) => [tx, ...prev.slice(0, 14)]);
  }, []);

  const toastBg =
    toast?.type === 'success'
      ? 'bg-emerald-600'
      : toast?.type === 'error'
      ? 'bg-rose-600'
      : 'bg-[#1D69A6]';

  return (
    <div className="min-h-screen flex items-center justify-center sm:py-3 bg-[#0b0f17]">
      <div
        id="app-frame"
        className="w-full sm:w-[412px] h-screen sm:h-[850px] bg-white sm:rounded-[34px] sm:border-[6px] sm:border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col relative"
      >
        {toast && (
          <div
            id="toast-box"
            role="status"
            aria-live="polite"
            className={`fixed sm:absolute bottom-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[365px] rounded-xl px-4 py-3 text-xs sm:text-sm font-extrabold text-white shadow-xl text-center pointer-events-none transition-all duration-200 ${toastBg}`}
          >
            <span id="toast-message">{toast.message}</span>
          </div>
        )}

        {screen === 'login' && (
          <LoginScreen
            onSuccess={() => setScreen('lobby')}
            onGoSignup={() => setScreen('signup')}
            onShowToast={showToast}
          />
        )}

        {screen === 'signup' && (
          <SignupScreen
            onSuccess={() => setScreen('lobby')}
            onGoLogin={() => setScreen('login')}
            onShowToast={showToast}
          />
        )}

        {screen === 'lobby' && (
          <LobbyScreen
            balance={balance}
            onOpenDeposit={() => setScreen('deposit')}
            onOpenWithdraw={() => setScreen('withdraw')}
            onOpenCrash={() => setScreen('crash')}
            onLogout={() => setScreen('login')}
            onShowToast={showToast}
          />
        )}

        {screen === 'deposit' && (
          <DepositScreen
            balance={balance}
            transactions={transactions}
            onBack={() => setScreen('lobby')}
            onDeposit={handleDeposit}
            onShowToast={showToast}
          />
        )}

        {screen === 'withdraw' && (
          <WithdrawScreen
            balance={balance}
            transactions={transactions}
            onBack={() => setScreen('lobby')}
            onWithdraw={handleWithdraw}
            onShowToast={showToast}
          />
        )}

        {screen === 'crash' && (
          <CrashGameScreen
            balance={balance}
            onBalanceDelta={handleBalanceDelta}
            onBack={() => setScreen('lobby')}
            onOpenDeposit={() => setScreen('deposit')}
            onShowToast={showToast}
          />
        )}
      </div>
    </div>
  );
}
