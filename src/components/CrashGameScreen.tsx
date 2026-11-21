import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  calculateMultiplier,
  calculatePayout,
  CrashPhase,
  formatEGP,
  generateCrashPoint,
  validateBet,
} from '../game/crashEngine';

interface CrashGameScreenProps {
  balance: number;
  onBalanceDelta: (delta: number) => void;
  onBack: () => void;
  onOpenDeposit: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface LiveBotPlayer {
  id: string;
  name: string;
  bet: number;
  targetMult: number;
  cashedOutAt: number | null;
  profit: number;
}

const COUNTDOWN_DURATION = 5.0;
const CRASH_PAUSE_DURATION = 2.4;
const PARTICLE_POOL_SIZE = 48;
const QUICK_BETS = [20, 50, 100, 200, 500];

const INITIAL_BOTS: LiveBotPlayer[] = [
  { id: 'b1', name: 'أحمد***', bet: 200, targetMult: 1.65, cashedOutAt: null, profit: 0 },
  { id: 'b2', name: 'محمود_99', bet: 500, targetMult: 2.15, cashedOutAt: null, profit: 0 },
  { id: 'b3', name: 'كريم***', bet: 100, targetMult: 1.4, cashedOutAt: null, profit: 0 },
  { id: 'b4', name: 'User_8421', bet: 150, targetMult: 2.8, cashedOutAt: null, profit: 0 },
  { id: 'b5', name: 'سارة***', bet: 250, targetMult: 1.9, cashedOutAt: null, profit: 0 },
  { id: 'b6', name: 'يوسف_10', bet: 300, targetMult: 3.4, cashedOutAt: null, profit: 0 },
  { id: 'b7', name: 'نور_77', bet: 120, targetMult: 2.4, cashedOutAt: null, profit: 0 },
  { id: 'b8', name: 'مصطفى***', bet: 400, targetMult: 1.75, cashedOutAt: null, profit: 0 },
  { id: 'b9', name: 'عمر_22', bet: 80, targetMult: 4.1, cashedOutAt: null, profit: 0 },
];

function createRoundBots(): LiveBotPlayer[] {
  return INITIAL_BOTS.map((b) => ({
    ...b,
    targetMult: Math.round((1.25 + Math.random() * 3.5) * 100) / 100,
    cashedOutAt: null,
    profit: 0,
  }));
}

export const CrashGameScreen: React.FC<CrashGameScreenProps> = ({
  balance,
  onBalanceDelta,
  onBack,
  onOpenDeposit,
  onShowToast,
}) => {
  const [phase, setPhase] = useState<CrashPhase>('countdown');
  const [prediction, setPrediction] = useState<number>(() => generateCrashPoint());
  const [history, setHistory] = useState<number[]>([3.4, 1.35, 5.12]);
  const [betInput, setBetInput] = useState('20');

  const [activeBet, setActiveBet] = useState<number | null>(null);
  const [queuedBet, setQueuedBet] = useState<number | null>(null);
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);
  const [roundCrashDisplay, setRoundCrashDisplay] = useState<number>(prediction);
  const [bots, setBots] = useState<LiveBotPlayer[]>(() => createRoundBots());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const liveMultiplierRef = useRef<HTMLDivElement | null>(null);
  const countdownTextRef = useRef<HTMLDivElement | null>(null);
  const countdownBarRef = useRef<HTMLDivElement | null>(null);
  const cashoutPayoutRef = useRef<HTMLSpanElement | null>(null);

  const phaseRef = useRef<CrashPhase>('countdown');
  const predictionRef = useRef<number>(prediction);
  const activeBetRef = useRef<number | null>(null);
  const queuedBetRef = useRef<number | null>(null);
  const cashedOutRef = useRef<number | null>(null);
  const currentMultiplierRef = useRef<number>(1.0);
  const botsRef = useRef<LiveBotPlayer[]>(bots);

  const onBalanceDeltaRef = useRef(onBalanceDelta);
  const onShowToastRef = useRef(onShowToast);
  useEffect(() => {
    onBalanceDeltaRef.current = onBalanceDelta;
    onShowToastRef.current = onShowToast;
  }, [onBalanceDelta, onShowToast]);

  useEffect(() => {
    activeBetRef.current = activeBet;
  }, [activeBet]);

  useEffect(() => {
    queuedBetRef.current = queuedBet;
  }, [queuedBet]);

  useEffect(() => {
    cashedOutRef.current = cashedOutMultiplier;
  }, [cashedOutMultiplier]);

  const performCashout = useCallback((multAtCashout: number) => {
    const bet = activeBetRef.current;
    if (!bet || cashedOutRef.current !== null || phaseRef.current !== 'flying') return;

    const payout = calculatePayout(bet, multAtCashout);
    cashedOutRef.current = multAtCashout;
    setCashedOutMultiplier(multAtCashout);
    onBalanceDeltaRef.current(payout);
    onShowToastRef.current(`تم السحب عند ${multAtCashout.toFixed(2)}x — ربحت ${formatEGP(payout)}`, 'success');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 360;
    let height = 220;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let areaGradient: CanvasGradient | null = null;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width || 360, 200);
      height = Math.max(rect.height || 220, 160);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      areaGradient = ctx.createLinearGradient(0, 24, 0, height - 26);
      areaGradient.addColorStop(0, 'rgba(255, 184, 0, 0.32)');
      areaGradient.addColorStop(1, 'rgba(255, 184, 0, 0.02)');
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas);

    const particles: Particle[] = Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0.4,
      size: 2,
      color: '#fbbf24',
    }));
    let particleCursor = 0;

    const spawnParticle = (
      x: number,
      y: number,
      vx: number,
      vy: number,
      maxLife: number,
      size: number,
      color: string
    ) => {
      const p = particles[particleCursor];
      particleCursor = (particleCursor + 1) % PARTICLE_POOL_SIZE;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = vx;
      p.vy = vy;
      p.life = maxLife;
      p.maxLife = maxLife;
      p.size = size;
      p.color = color;
    };

    let timerInPhase = COUNTDOWN_DURATION;
    let flightElapsed = 0;
    let shakeTrauma = 0;
    let exhaustAccum = 0;
    let lastTs = performance.now();
    let rafId = 0;

    const drawGrid = () => {
      ctx.fillStyle = '#0D151F';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 44; x < width; x += 44) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 38; y < height; y += 38) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawAirplane = (x: number, y: number, angle: number, crashed: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      if (!crashed) {
        ctx.beginPath();
        ctx.moveTo(-16, -3);
        ctx.lineTo(-30 - Math.random() * 5, 0);
        ctx.lineTo(-16, 4);
        ctx.closePath();
        ctx.fillStyle = '#fb923c';
        ctx.fill();
      }

      // Tail fin
      ctx.beginPath();
      ctx.moveTo(-15, -2);
      ctx.lineTo(-22, -13);
      ctx.lineTo(-10, -13);
      ctx.lineTo(-5, -2);
      ctx.closePath();
      ctx.fillStyle = crashed ? '#991b1b' : '#dc2626';
      ctx.fill();

      // Main red/white fuselage
      ctx.beginPath();
      ctx.ellipse(3, 0, 20, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = crashed ? '#fca5a5' : '#ef4444';
      ctx.fill();

      // White top stripe
      ctx.beginPath();
      ctx.ellipse(4, -1.8, 15, 2.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Wing
      ctx.beginPath();
      ctx.moveTo(3, 2);
      ctx.lineTo(-9, 12);
      ctx.lineTo(-14, 10);
      ctx.lineTo(-5, 2);
      ctx.closePath();
      ctx.fillStyle = crashed ? '#b91c1c' : '#dc2626';
      ctx.fill();

      // Cockpit
      ctx.beginPath();
      ctx.ellipse(15, -1.5, 4, 2, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;

      if (phaseRef.current === 'countdown') {
        timerInPhase -= dt;
        const clamped = Math.max(0, timerInPhase);
        if (countdownTextRef.current) {
          countdownTextRef.current.textContent = `${clamped.toFixed(1)}s`;
        }
        if (countdownBarRef.current) {
          countdownBarRef.current.style.width = `${(clamped / COUNTDOWN_DURATION) * 100}%`;
        }

        if (timerInPhase <= 0) {
          phaseRef.current = 'flying';
          flightElapsed = 0;
          currentMultiplierRef.current = 1.0;
          setPhase('flying');
          if (liveMultiplierRef.current) {
            liveMultiplierRef.current.textContent = '1.00x';
          }
        }
      } else if (phaseRef.current === 'flying') {
        flightElapsed += dt;
        const mult = calculateMultiplier(flightElapsed);
        currentMultiplierRef.current = mult;

        if (liveMultiplierRef.current) {
          liveMultiplierRef.current.textContent = `${mult.toFixed(2)}x`;
        }
        if (cashoutPayoutRef.current && activeBetRef.current && cashedOutRef.current === null) {
          const payout = calculatePayout(activeBetRef.current, mult);
          cashoutPayoutRef.current.textContent = `${payout.toFixed(2)} ج.م`;
        }

        // Update bot cashouts discreetly only when any bot crosses its target
        let botChanged = false;
        const updatedBots = botsRef.current.map((b) => {
          if (b.cashedOutAt === null && mult >= b.targetMult && mult < predictionRef.current) {
            botChanged = true;
            return {
              ...b,
              cashedOutAt: b.targetMult,
              profit: calculatePayout(b.bet, b.targetMult),
            };
          }
          return b;
        });
        if (botChanged) {
          botsRef.current = updatedBots;
          setBots(updatedBots);
        }

        if (mult >= predictionRef.current) {
          const finalCrash = predictionRef.current;
          phaseRef.current = 'crashed';
          timerInPhase = CRASH_PAUSE_DURATION;
          shakeTrauma = 1.0;

          const progress = 1 - Math.exp(-flightElapsed * 0.42);
          const tipX = 36 + (width - 80) * (0.08 + progress * 0.88);
          const tipY = height - 28 - (height - 68) * Math.pow(progress, 1.18);
          for (let i = 0; i < 24; i++) {
            const a = (Math.PI * 2 * i) / 24 + Math.random() * 0.25;
            const spd = 45 + Math.random() * 140;
            spawnParticle(
              tipX,
              tipY,
              Math.cos(a) * spd,
              Math.sin(a) * spd,
              0.45 + Math.random() * 0.35,
              2.5 + Math.random() * 3,
              i % 2 === 0 ? '#ef4444' : '#fbbf24'
            );
          }

          setRoundCrashDisplay(finalCrash);
          setHistory((prev) => [finalCrash, ...prev.slice(0, 4)]);
          setPhase('crashed');
        }
      } else if (phaseRef.current === 'crashed') {
        timerInPhase -= dt;
        shakeTrauma = Math.max(0, shakeTrauma - dt * 2.2);

        if (timerInPhase <= 0) {
          const nextCrash = generateCrashPoint();
          predictionRef.current = nextCrash;
          setPrediction(nextCrash);

          const nextBots = createRoundBots();
          botsRef.current = nextBots;
          setBots(nextBots);

          const nextQueued = queuedBetRef.current;
          if (nextQueued !== null) {
            activeBetRef.current = nextQueued;
            queuedBetRef.current = null;
            setActiveBet(nextQueued);
            setQueuedBet(null);
          } else {
            activeBetRef.current = null;
            setActiveBet(null);
          }

          cashedOutRef.current = null;
          setCashedOutMultiplier(null);
          currentMultiplierRef.current = 1.0;

          phaseRef.current = 'countdown';
          timerInPhase = COUNTDOWN_DURATION;
          setPhase('countdown');
        }
      }

      ctx.save();
      if (shakeTrauma > 0) {
        const mag = shakeTrauma * shakeTrauma * 6;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      drawGrid();

      if (phaseRef.current === 'countdown') {
        // Plane parked cleanly at bottom-left runway matching video frame 00:05
        drawAirplane(44, height - 30, -0.05, false);
      } else if (phaseRef.current === 'flying' || phaseRef.current === 'crashed') {
        const progress = 1 - Math.exp(-flightElapsed * 0.42);
        const startX = 36;
        const startY = height - 28;
        const endX = startX + (width - 80) * (0.08 + progress * 0.88);
        const endY = startY - (height - 68) * Math.pow(progress, 1.18);
        const ctrlX = startX + (endX - startX) * 0.56;
        const ctrlY = startY - (startY - endY) * 0.16;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();
        if (phaseRef.current === 'crashed') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
        } else if (areaGradient) {
          ctx.fillStyle = areaGradient;
        }
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.strokeStyle = phaseRef.current === 'crashed' ? '#ef4444' : '#FFB800';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        const angle = Math.atan2(endY - ctrlY, endX - ctrlX);

        if (phaseRef.current === 'flying') {
          exhaustAccum += dt;
          if (exhaustAccum >= 0.03) {
            exhaustAccum = 0;
            spawnParticle(
              endX - Math.cos(angle) * 16,
              endY - Math.sin(angle) * 16,
              -Math.cos(angle) * 45 + (Math.random() - 0.5) * 20,
              -Math.sin(angle) * 45 + (Math.random() - 0.5) * 20,
              0.35,
              2 + Math.random() * 2,
              '#fb923c'
            );
          }
        }

        drawAirplane(endX, endY, angle, phaseRef.current === 'crashed');
      }

      for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
        const p = particles[i];
        if (!p.active) continue;
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  const parsedBet = Number(betInput);

  const handlePlaceOrCancelBet = () => {
    if (phase === 'countdown') {
      if (activeBet !== null) {
        onBalanceDelta(activeBet);
        activeBetRef.current = null;
        setActiveBet(null);
        onShowToast('تم إلغاء الرهان واسترداد المبلغ', 'info');
        return;
      }
      const check = validateBet(parsedBet, balance);
      if (!check.ok) {
        onShowToast(check.error || 'خطأ في الرهان', 'error');
        return;
      }
      onBalanceDelta(-parsedBet);
      activeBetRef.current = parsedBet;
      setActiveBet(parsedBet);
      onShowToast(`تم تأكيد الرهان بمبلغ ${formatEGP(parsedBet)}`, 'success');
      return;
    }

    if (queuedBet !== null) {
      onBalanceDelta(queuedBet);
      queuedBetRef.current = null;
      setQueuedBet(null);
      onShowToast('تم إلغاء رهان الجولة القادمة', 'info');
      return;
    }
    const check = validateBet(parsedBet, balance);
    if (!check.ok) {
      onShowToast(check.error || 'خطأ في الرهان', 'error');
      return;
    }
    onBalanceDelta(-parsedBet);
    queuedBetRef.current = parsedBet;
    setQueuedBet(parsedBet);
    onShowToast(`تم حجز رهان ${formatEGP(parsedBet)} للجولة القادمة`, 'info');
  };

  const adjustBet = (multiplier: number) => {
    const base = Number.isFinite(parsedBet) && parsedBet > 0 ? parsedBet : 20;
    const next = Math.max(1, Math.round(base * multiplier));
    setBetInput(String(next));
  };

  return (
    <section
      id="screen-crash"
      data-crash-phase={phase}
      className="flex-1 flex flex-col bg-[#101923] text-white overflow-y-auto no-scrollbar"
    >
      <header className="bg-[#162230] px-3 py-2 flex items-center justify-between border-b border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (activeBetRef.current && phaseRef.current === 'countdown') {
              onBalanceDelta(activeBetRef.current);
            }
            if (queuedBetRef.current) {
              onBalanceDelta(queuedBetRef.current);
            }
            onBack();
          }}
          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
        >
          <span>→</span>
          <span>رجوع</span>
        </button>

        <div className="bg-[#FFD600] text-slate-950 px-2.5 py-1 rounded-xl shadow-md border border-yellow-300 flex items-center gap-1">
          <span className="text-xs">⚠️</span>
          <span className="text-[10.5px] font-black">ستنفجر الطيارة عند:</span>
          <span id="prediction-value" className="text-xs font-black tabular-nums" dir="ltr">
            {prediction.toFixed(2)}x
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenDeposit}
          className="bg-[#0B121A] border border-slate-700 px-2.5 py-1 rounded-xl cursor-pointer"
        >
          <span id="crash-balance" className="text-[11px] font-black text-amber-300 tabular-nums">
            {formatEGP(balance)}
          </span>
        </button>
      </header>

      <div className="p-3 space-y-2.5 flex-1 flex flex-col">
        {/* Flight Viewport */}
        <div className="relative w-full h-[220px] bg-[#0D151F] rounded-2xl border border-slate-700/80 overflow-hidden shadow-inner shrink-0">
          <div id="history-pills" className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1" dir="ltr">
            {history.slice(0, 5).map((val, idx) => (
              <span
                key={`${val}-${idx}`}
                className={`bg-slate-900/90 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-700/60 tabular-nums ${
                  val >= 2 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {val.toFixed(2)}x
              </span>
            ))}
          </div>

          <canvas ref={canvasRef} id="crash-canvas" data-testid="crash-canvas" className="w-full h-full block" />

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4 text-center">
            {phase === 'countdown' && (
              <div id="state-countdown" className="flex flex-col items-center bg-[#0D151F]/80 px-5 py-3 rounded-2xl">
                <span className="text-xs font-extrabold text-amber-300 mb-1">جاري انتظار الرهانات...</span>
                <div ref={countdownTextRef} id="countdown-text" className="text-2xl font-black text-white tabular-nums">
                  5.0s
                </div>
                <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden mt-2 border border-slate-700">
                  <div
                    ref={countdownBarRef}
                    id="countdown-bar"
                    className="h-full bg-[#FFB800]"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            {phase === 'flying' && (
              <div id="state-flying" className="flex flex-col items-center">
                <div
                  ref={liveMultiplierRef}
                  id="live-multiplier"
                  className={`text-5xl font-black drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)] tracking-tight tabular-nums ${
                    cashedOutMultiplier !== null ? 'text-emerald-400' : 'text-white'
                  }`}
                  dir="ltr"
                >
                  {currentMultiplierRef.current.toFixed(2)}x
                </div>
                {cashedOutMultiplier !== null && (
                  <span className="mt-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-black px-3 py-0.5 rounded-lg">
                    تم السحب عند {cashedOutMultiplier.toFixed(2)}x ✓
                  </span>
                )}
              </div>
            )}

            {phase === 'crashed' && (
              <div id="state-crashed" className="flex flex-col items-center bg-red-950/90 px-4 py-2 rounded-2xl border border-red-500/50">
                <div id="crash-final-text" className="text-lg sm:text-xl font-black text-red-400 tabular-nums">
                  انفجرت الطيارة <span dir="ltr">@ {roundCrashDisplay.toFixed(2)}x</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Betting Controls Card matching video frame 00:05 */}
        <div className="bg-[#162230] border border-slate-800 rounded-2xl p-3 space-y-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <label htmlFor="crash-bet-input" className="text-xs font-extrabold text-slate-300 shrink-0">
              مبلغ الرهان:
            </label>
            <div className="flex-1 flex items-center bg-[#0B121A] border border-slate-700 rounded-xl px-2.5 py-1.5">
              <input
                id="crash-bet-input"
                type="number"
                min="1"
                step="5"
                value={betInput}
                onChange={(e) => setBetInput(e.target.value)}
                className="w-full bg-transparent text-sm font-black text-white outline-none text-center tabular-nums"
              />
              <span className="text-[11px] font-bold text-slate-400 shrink-0">ج.م</span>
            </div>
            <button
              type="button"
              onClick={() => adjustBet(0.5)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black px-3 py-2 rounded-xl cursor-pointer"
              dir="ltr"
            >
              1/2
            </button>
            <button
              type="button"
              onClick={() => adjustBet(2)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black px-3 py-2 rounded-xl cursor-pointer"
              dir="ltr"
            >
              x2
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {QUICK_BETS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setBetInput(String(amt))}
                className="bg-[#0B121A] hover:bg-slate-800 border border-slate-700/80 rounded-lg py-1.5 text-xs font-black text-slate-200 cursor-pointer tabular-nums"
              >
                {amt}
              </button>
            ))}
          </div>

          {phase === 'flying' && activeBet !== null && cashedOutMultiplier === null ? (
            <button
              type="button"
              id="btn-cashout"
              onClick={() => performCashout(currentMultiplierRef.current)}
              className="w-full bg-[#2ECC71] hover:bg-[#27ae60] active:scale-[0.99] text-slate-950 font-black text-base py-3.5 rounded-xl shadow-lg cashout-glow transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>سحب الأرباح</span>
              <span ref={cashoutPayoutRef} className="tabular-nums">
                {formatEGP(calculatePayout(activeBet, currentMultiplierRef.current))}
              </span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-place-bet"
              onClick={handlePlaceOrCancelBet}
              className={`w-full font-black text-base py-3.5 rounded-xl shadow-md active:scale-[0.99] transition cursor-pointer ${
                (phase === 'countdown' && activeBet !== null) || queuedBet !== null
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-[#FFB800] hover:bg-[#eab308] text-slate-950'
              }`}
            >
              {phase === 'countdown'
                ? activeBet !== null
                  ? `إلغاء الرهان (${formatEGP(activeBet)})`
                  : 'تأكيد الرهان'
                : queuedBet !== null
                ? `إلغاء رهان الجولة القادمة (${formatEGP(queuedBet)})`
                : 'تأكيد الرهان'}
            </button>
          )}
        </div>

        {/* Live Players Table matching video frame 00:05 */}
        <div className="bg-[#162230] border border-slate-800 rounded-2xl p-3 flex-1 flex flex-col min-h-[170px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-white">اللاعبون المباشرون</span>
            <span className="text-[11px] font-extrabold text-emerald-400">9 متصلون</span>
          </div>

          <div className="grid grid-cols-4 text-[10px] font-extrabold text-slate-400 pb-1.5 border-b border-slate-800">
            <span className="text-right">المستخدم</span>
            <span className="text-center">الرهان</span>
            <span className="text-center">المضاعف</span>
            <span className="text-left">الربح</span>
          </div>

          <div className="divide-y divide-slate-800/70 text-[11px]">
            {activeBet !== null && (
              <div className="grid grid-cols-4 py-1.5 items-center bg-amber-500/10 rounded px-1">
                <span className="font-black text-amber-300 text-right">أنت</span>
                <span className="font-bold text-white text-center tabular-nums">{activeBet} ج.م</span>
                <span className="font-black text-emerald-400 text-center tabular-nums" dir="ltr">
                  {cashedOutMultiplier ? `${cashedOutMultiplier.toFixed(2)}x` : '-'}
                </span>
                <span className="font-black text-emerald-400 text-left tabular-nums">
                  {cashedOutMultiplier ? `${calculatePayout(activeBet, cashedOutMultiplier).toFixed(0)} ج.م` : '-'}
                </span>
              </div>
            )}

            {bots.map((bot) => (
              <div key={bot.id} className="grid grid-cols-4 py-1.5 items-center">
                <span className="font-bold text-slate-200 text-right truncate">{bot.name}</span>
                <span className="font-bold text-slate-300 text-center tabular-nums">{bot.bet} ج.م</span>
                <span
                  className={`font-extrabold text-center tabular-nums ${
                    bot.cashedOutAt ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                  dir="ltr"
                >
                  {bot.cashedOutAt ? `${bot.cashedOutAt.toFixed(2)}x` : '-'}
                </span>
                <span
                  className={`font-extrabold text-left tabular-nums ${
                    bot.cashedOutAt ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {bot.cashedOutAt ? `${bot.profit.toFixed(0)} ج.م` : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
