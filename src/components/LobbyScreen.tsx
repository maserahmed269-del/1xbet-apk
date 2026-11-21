import React, { useEffect, useRef } from 'react';
import { LogOut, Wallet } from 'lucide-react';
import { formatEGP } from '../game/crashEngine';
import {
  drawAppleThumb,
  drawCrashThumb,
  drawCrystalThumb,
  drawDiceThumb,
  drawSwampThumb,
} from '../game/thumbnailArt';

interface LobbyScreenProps {
  balance: number;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenCrash: () => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const SECONDARY_GAMES = [
  {
    id: 'apple',
    title: 'Apple Of Fortune',
    subtitle: 'تفاحة الحظ',
    border: 'border-emerald-500/40',
    accent: 'text-emerald-300',
    draw: drawAppleThumb,
  },
  {
    id: 'dice',
    title: 'Under & Over 7',
    subtitle: 'نرد الحظ 7',
    border: 'border-rose-500/40',
    accent: 'text-rose-300',
    draw: drawDiceThumb,
  },
  {
    id: 'crystal',
    title: 'Crystal',
    subtitle: 'الجواهر',
    border: 'border-purple-500/40',
    accent: 'text-purple-300',
    draw: drawCrystalThumb,
  },
  {
    id: 'swamp',
    title: 'Swamp Land',
    subtitle: 'أرض المستنقع',
    border: 'border-teal-500/40',
    accent: 'text-teal-300',
    draw: drawSwampThumb,
  },
] as const;

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  balance,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenCrash,
  onLogout,
  onShowToast,
}) => {
  const crashCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const secondaryRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    const paintAll = () => {
      if (crashCanvasRef.current) drawCrashThumb(crashCanvasRef.current);
      for (const game of SECONDARY_GAMES) {
        const el = secondaryRefs.current[game.id];
        if (el) game.draw(el);
      }
    };
    const raf = requestAnimationFrame(paintAll);
    window.addEventListener('resize', paintAll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', paintAll);
    };
  }, []);

  return (
    <section id="screen-lobby" className="flex-1 flex flex-col bg-[#101923] text-white overflow-y-auto no-scrollbar">
      <header className="bg-[#162230] px-3 py-3 flex items-center justify-between border-b border-slate-800/90 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDeposit}
            className="bg-[#4CAF50] hover:bg-[#43A047] active:scale-95 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow flex items-center gap-1 transition cursor-pointer"
          >
            <span className="text-base leading-none">+</span>
            <span>إيداع</span>
          </button>

          <button
            type="button"
            onClick={onOpenWithdraw}
            className="bg-[#1D69A6] hover:bg-[#175587] active:scale-95 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow flex items-center gap-1 transition cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>سحب</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="bg-[#0B121A] border border-slate-700/90 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span id="lobby-balance" className="text-xs font-black text-white tracking-wide tabular-nums">
              {formatEGP(balance)}
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="p-3.5 space-y-3.5 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-300 tracking-wide">1XGAMES — الألعاب</span>
          <span className="text-[11px] font-bold text-amber-400">اختر لعبة للبدء</span>
        </div>

        <button
          type="button"
          onClick={onOpenCrash}
          aria-label="العب الآن لعبة Crash الطيارة"
          className="relative block w-full h-[192px] rounded-[14px] overflow-hidden border-2 border-amber-400/85 shadow-[0_8px_25px_rgba(245,158,11,0.22)] cursor-pointer active:scale-[0.99] transition group text-right"
        >
          <canvas ref={crashCanvasRef} className="w-full h-full block" />
          <div className="absolute bottom-3 left-3 z-10 bg-[#2ECC71] group-hover:bg-[#27ae60] text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
            <span>العب الآن</span>
            <span>◀</span>
          </div>
          <div className="absolute bottom-2.5 right-3.5 z-10 text-right pointer-events-none">
            <div
              className="text-2xl font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              dir="ltr"
              style={{ textShadow: '0 2px 0 #b45309, 0 4px 10px rgba(0,0,0,0.85)' }}
            >
              CRASH
            </div>
            <div className="text-[11px] font-extrabold text-amber-300">لعبة الطيارة</div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3 pt-0.5">
          {SECONDARY_GAMES.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => onShowToast(`لعبة ${game.title} — قريباً`, 'info')}
              aria-label={`${game.title} — ${game.subtitle} (قريباً)`}
              className={`relative h-[148px] rounded-[14px] overflow-hidden border ${game.border} shadow-md cursor-pointer active:scale-95 transition text-right`}
            >
              <canvas
                ref={(el) => {
                  secondaryRefs.current[game.id] = el;
                }}
                className="w-full h-full block"
              />
              <div className="absolute top-2 left-2 bg-black/65 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-400/30">
                🔒 قريباً
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2.5">
                <div className="text-xs font-black text-white leading-tight" dir="ltr">
                  {game.title}
                </div>
                <div className={`text-[10px] ${game.accent} font-bold`}>{game.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
