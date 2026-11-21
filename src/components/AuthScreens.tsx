import React, { useState } from 'react';
import { Lock, Phone } from 'lucide-react';

interface AuthProps {
  onSuccess: (phone: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const LoginScreen: React.FC<AuthProps & { onGoSignup: () => void }> = ({
  onSuccess,
  onGoSignup,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(phone.trim() || '01000000000');
  };

  return (
    <section id="screen-login" className="flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar">
      <div className="xbet-auth-header h-44 w-full shrink-0 flex flex-col items-center justify-center text-white px-4">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-cyan-400/15" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-1 text-3xl font-black tracking-tighter select-none" dir="ltr">
            <span className="text-white">1X</span>
            <span className="text-sky-300">BET</span>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-md mr-1 font-bold tracking-normal">
              DEMO
            </span>
          </div>
          <p className="text-xs text-sky-100 mt-1.5 font-semibold">منصة محاكاة تعليمية</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-5 pt-6 pb-6 flex flex-col bg-white">
        <h2 className="text-2xl font-black text-slate-800 text-center mb-6">تسجيل الدخول</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="login-phone" className="block text-xs font-extrabold text-slate-600 mb-1.5 pr-1">
              رقم الهاتف
            </label>
            <div className="relative flex items-center">
              <span className="absolute right-3.5 text-slate-400 pointer-events-none">
                <Phone className="w-5 h-5" />
              </span>
              <input
                id="login-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010xxxxxxxx"
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-bold rounded-xl pr-11 pl-4 py-3.5 border border-slate-300 focus:border-[#1D69A6] focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-pass" className="block text-xs font-extrabold text-slate-600 mb-1.5 pr-1">
              كلمة السر
            </label>
            <div className="relative flex items-center">
              <span className="absolute right-3.5 text-slate-400 pointer-events-none">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="login-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-bold rounded-xl pr-11 pl-4 py-3.5 border border-slate-300 focus:border-[#1D69A6] focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1D69A6] hover:bg-[#175587] active:scale-[0.99] text-white font-black text-base py-3.5 rounded-xl shadow-md transition mt-2 cursor-pointer"
          >
            دخول
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onGoSignup}
            className="text-sm font-extrabold text-[#1D69A6] hover:underline cursor-pointer"
          >
            إنشاء حساب جديد
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-auto pt-4">
          اضغط على &quot;دخول&quot; مباشرة بأي بيانات لتجربة الواجهة
        </p>
      </form>
    </section>
  );
};

export const SignupScreen: React.FC<AuthProps & { onGoLogin: () => void }> = ({
  onSuccess,
  onGoLogin,
  onShowToast,
}) => {
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass && pass !== pass2) {
      onShowToast('كلمتا السر غير متطابقتين', 'error');
      return;
    }
    onSuccess(phone.trim() || '01000000000');
  };

  return (
    <section id="screen-signup" className="flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar">
      <div className="xbet-auth-header h-36 w-full shrink-0 flex flex-col items-center justify-center text-white px-4">
        <div className="flex items-center gap-1 text-2xl font-black tracking-tighter" dir="ltr">
          <span className="text-white">1X</span>
          <span className="text-sky-300">BET</span>
        </div>
        <p className="text-xs text-sky-100 mt-1 font-bold">تسجيل حساب تجريبي جديد</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-5 pt-5 pb-6 flex flex-col bg-white">
        <h2 className="text-xl font-black text-slate-800 text-center mb-5">إنشاء حساب جديد</h2>

        <div className="space-y-3.5">
          <div>
            <label htmlFor="signup-phone" className="block text-xs font-extrabold text-slate-600 mb-1 pr-1">
              رقم الهاتف
            </label>
            <input
              id="signup-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010xxxxxxxx"
              className="w-full bg-slate-50 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 border border-slate-300 focus:border-[#1D69A6] outline-none"
            />
          </div>

          <div>
            <label htmlFor="signup-pass" className="block text-xs font-extrabold text-slate-600 mb-1 pr-1">
              كلمة السر
            </label>
            <input
              id="signup-pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 border border-slate-300 focus:border-[#1D69A6] outline-none"
            />
          </div>

          <div>
            <label htmlFor="signup-pass2" className="block text-xs font-extrabold text-slate-600 mb-1 pr-1">
              تأكيد كلمة السر
            </label>
            <input
              id="signup-pass2"
              type="password"
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 border border-slate-300 focus:border-[#1D69A6] outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1D69A6] hover:bg-[#175587] active:scale-[0.99] text-white font-black text-base py-3.5 rounded-xl shadow-md transition mt-2 cursor-pointer"
          >
            إنشاء حساب ودخول
          </button>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onGoLogin}
            className="text-sm font-bold text-slate-600 cursor-pointer"
          >
            لديك حساب بالفعل؟ <span className="text-[#1D69A6] font-extrabold underline">تسجيل الدخول</span>
          </button>
        </div>
      </form>
    </section>
  );
};
