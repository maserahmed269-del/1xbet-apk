import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'dark' | 'light' }> = ({ variant = 'dark' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        aria-label="تثبيت تطبيق 1xbet"
        className={
          variant === 'light'
            ? 'inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-extrabold text-[#1D69A6] transition cursor-pointer'
            : 'inline-flex items-center gap-1.5 rounded-xl bg-sky-600/25 hover:bg-sky-600/40 border border-sky-400/40 px-2.5 py-1.5 text-[11px] font-extrabold text-sky-200 transition cursor-pointer'
        }
      >
        <Download className="w-3.5 h-3.5" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label="تثبيت التطبيق على iOS"
          className={
            variant === 'light'
              ? 'inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-extrabold text-[#1D69A6] transition cursor-pointer'
              : 'inline-flex items-center gap-1.5 rounded-xl bg-sky-600/25 hover:bg-sky-600/40 border border-sky-400/40 px-2.5 py-1.5 text-[11px] font-extrabold text-sky-200 transition cursor-pointer'
          }
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#162230] border border-slate-700 p-5 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <img src="/pwa-192x192.png" alt="1xbet" className="w-11 h-11 rounded-xl border border-slate-600" />
                <div>
                  <h3 className="text-base font-black">تثبيت تطبيق 1xbet</h3>
                  <p className="text-xs text-slate-400">على أجهزة iPhone و iPad</p>
                </div>
              </div>
              <p className="text-xs leading-6 text-slate-200">
                1. اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari.<br />
                2. مرّر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-[#1D69A6] hover:bg-[#175587] py-2.5 text-xs font-black text-white cursor-pointer"
              >
                حسناً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-lg">
      <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
      <span>وضع عدم الاتصال — يعمل التطبيق محلياً</span>
    </div>
  );
};
