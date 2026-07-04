import React, { useState } from 'react';
import { Shield, ArrowRight, Globe } from 'lucide-react';
import { Language, translations } from '../types';
import earthHandshakeVisual from '../assets/images/earth_handshake_visual_1782969002998.jpg';

interface SplashPageProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onEnter: () => void;
}

const LANGUAGES_LIST = [
  { code: 'cn', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: '印地语' },
  { code: 'fa', label: '波斯语' },
  { code: 'id', label: '印尼语' },
  { code: 'th', label: '泰语' },
  { code: 'vi', label: '越南语' },
];

export function BrandLogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="cyanFlow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path 
        d="M 50 15 C 65 15, 80 20, 80 20 C 80 45, 70 70, 50 85 C 30 70, 20 45, 20 20 C 20 20, 35 15, 50 15 Z" 
        fill="url(#shieldGrad)" 
        stroke="url(#cyanFlow)" 
        strokeWidth="3" 
      />
      <line x1="50" y1="28" x2="50" y2="72" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
      <path d="M 32 40 L 50 54 L 68 40" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SplashPage({ language, setLanguage, onEnter }: SplashPageProps) {
  const t = translations[language];
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-[#030712] text-slate-100 flex flex-col justify-between overflow-y-auto overflow-x-hidden z-50 select-none">
      
      {/* 1. Subtle Premium Ambient Background */}
      {/* Tiny subtle technical grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.15)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] pointer-events-none" />
      
      {/* Broad, elegant ambient space glow (Deep Slate & Blue-Cyan) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-950/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-blue-950/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Pristine scattered stars (strictly static, elegant) */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute top-[12%] left-[15%] w-1 h-1 bg-white rounded-full" />
        <div className="absolute top-[28%] left-[82%] w-1 h-1 bg-cyan-400 rounded-full" />
        <div className="absolute top-[68%] left-[8%] w-1.5 h-1.5 bg-blue-400 rounded-full" />
        <div className="absolute top-[75%] left-[88%] w-1 h-1 bg-white rounded-full" />
        <div className="absolute top-[45%] left-[19%] w-1 h-1 bg-cyan-500 rounded-full" />
        <div className="absolute top-[52%] left-[76%] w-1.5 h-1.5 bg-blue-300 rounded-full" />
      </div>

      {/* 2. Top Navigation Bar */}
      <div className="relative w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-30">
        {/* Left Side: 衡信 */}
        <div className="flex items-center gap-3">
          <BrandLogoIcon className="h-8 w-8 text-cyan-400" />
          <div className="flex flex-col items-start border-l border-slate-800 pl-3">
            <span className="text-xl font-bold tracking-widest text-slate-100 font-sans">
              衡信
            </span>
            <span className="text-[9px] text-cyan-400 font-mono tracking-wider">
              VERICRED TRUST NETWORK
            </span>
          </div>
        </div>

        {/* Center Indicators - Clean & Professional */}
        <div className="hidden md:flex items-center gap-4 bg-slate-950/80 border border-slate-900/40 rounded-full px-4 py-1 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            东南亚 (SEA)
          </span>
          <span className="text-slate-800">|</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
            非洲 (AFRICA)
          </span>
          <span className="text-slate-800">|</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            印度 (INDIA)
          </span>
          <span className="text-slate-800">|</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
            伊朗 (IRAN)
          </span>
        </div>

        {/* Right Side: VeriCred + Lang Selector */}
        <div className="flex items-center gap-5">
          <span className="text-lg font-bold tracking-wider text-slate-300 font-mono">
            VeriCred
          </span>
          
          {/* Language Dropdown Selector */}
          <div className="relative inline-block text-left" id="splash-lang-dropdown">
            <div>
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-slate-100 border border-slate-800 transition-all focus:outline-none cursor-pointer"
                id="splash-lang-menu-button"
                aria-expanded="true"
                aria-haspopup="true"
              >
                <Globe className="h-3.5 w-3.5 text-cyan-500" />
                <span>
                  {LANGUAGES_LIST.find((l) => l.code === language)?.label || 'Language'}
                </span>
                <svg className={`h-3 w-3 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {isLangOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-30" onClick={() => setIsLangOpen(false)} />
                <div 
                  className={`absolute ${language === 'fa' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} mt-2 w-36 rounded-lg bg-slate-950 border border-slate-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-40 animate-[fadeIn_0.15s_ease-out]`}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="splash-lang-menu-button"
                >
                  <div className="py-1" role="none">
                    {LANGUAGES_LIST.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as Language);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          language === lang.code
                            ? 'bg-slate-900 text-cyan-400 font-semibold'
                            : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                        }`}
                        role="menuitem"
                      >
                        <span>{lang.label}</span>
                        {language === lang.code && (
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Central Stage: HIGH-FIDELITY STATIC 3D GLOBE & HANDSHAKE SYMBOL */}
      <div className="relative flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 z-10 py-4">
        
        {/* Core Visual Frame Container */}
        <div className="relative w-[340px] h-[340px] md:w-[580px] md:h-[580px] flex items-center justify-center select-none">
          <img 
            src={earthHandshakeVisual} 
            alt="3D Earth and Business Handshake" 
            className="w-full h-full object-contain filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* 4. Core Brand Texts Block */}
        <div className="relative mt-3 text-center max-w-2xl z-20 px-4 flex flex-col items-center">
          
          {/* Neutrality and Veracity Trust Badge */}
          <div className="mb-4">
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-mono border tracking-wider flex items-center gap-2 bg-slate-950/90 text-emerald-400 border-slate-800/80 shadow-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              {language === 'cn' 
                ? '「衡信」双向真实背景核验直连通道已就绪' 
                : 'VERICRED SECURE DIRECT-CONNECT NODE ACTIVE'}
            </span>
          </div>

          {/* Title: 衡信 VERICRED */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest text-slate-100 uppercase font-sans">
            {t.splashTitle}
          </h1>

          {/* Subtitle: 跨境企业实力核验与供需对接平台 */}
          <h2 className="text-sm md:text-base text-cyan-400 font-semibold tracking-wide mt-2">
            {t.splashSubtitle}
          </h2>

          {/* Description */}
          <p className="text-xs md:text-sm text-slate-400 mt-4 leading-relaxed max-w-lg">
            {t.splashIntro}
          </p>

          {/* Keywords Showcase: 真实、核验、信任、全球、商务、科技、中立 */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-5 max-w-md">
            {['真实 ‧ Veracious', '核验 ‧ Validated', '信任 ‧ Trustworthy', '全球 ‧ Global', '商务 ‧ Corporate', '科技 ‧ Edge Tech', '中立 ‧ Mutilateral-Neutral'].map((word, i) => (
              <span key={i} className="text-[10px] md:text-xs font-mono px-2.5 py-0.5 rounded bg-slate-900/40 border border-slate-800/30 text-slate-500">
                {language === 'cn' ? word.split(' ‧ ')[0] : word.split(' ‧ ')[1]}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Clean Bottom Footer with "Enter Platform" action */}
      <div className="relative w-full border-t border-slate-900/60 bg-slate-950/90 backdrop-blur-md z-30 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Tech Status Summary */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 order-2 sm:order-1">
            <Shield className="h-3.5 w-3.5 text-cyan-500" />
            <span>CLOUD_PAGES // GLOBAL_D1_SQL // SECURE_SHIELD_V2</span>
          </div>

          {/* Main Action Button */}
          <button
            id="splash-enter-cta"
            onClick={onEnter}
            className="group px-9 py-3 rounded-lg text-slate-950 font-bold text-xs font-mono tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all duration-300 flex items-center gap-2.5 cursor-pointer shadow-lg shadow-cyan-500/10 order-1 sm:order-2"
          >
            <span>{t.splashEnter}</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
          </button>

          {/* Compliance */}
          <div className="text-[10px] font-mono text-slate-500 order-3 hidden md:block">
            <span>SECURE SHIELD PRO // ZERO_COMMISSION</span>
          </div>

        </div>
      </div>

    </div>
  );
}
