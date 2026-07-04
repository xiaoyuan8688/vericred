import React, { useState, useEffect } from 'react';
import { Shield, Globe, Cpu, Server, Database, Clock, Settings } from 'lucide-react';
import { Language, translations } from '../types';
import { BrandLogoIcon } from './SplashPage';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  isAdminMode: boolean;
  toggleAdminMode: () => void;
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

export default function Navbar({ language, setLanguage, activeSection, setActiveSection, isAdminMode, toggleAdminMode }: NavbarProps) {
  const t = translations[language];
  const [currentTime, setCurrentTime] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Update clock in real-time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to YYYY-MM-DD HH:mm:ss in ISO format
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
      setCurrentTime(formatted + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'hero', label: t.navHome },
    { id: 'regions', label: t.navRegions },
    { id: 'agent', label: t.navAgent },
    { id: 'suppliers', label: t.navSuppliers },
    { id: 'matchmaking', label: t.navMatchmaking },
  ];

  return (
    <header className="sticky top-0 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-900 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo with cyberpunk accents */}
          <div 
            onClick={() => {
              setActiveSection('hero');
              const el = document.getElementById('hero');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative h-10 w-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                <BrandLogoIcon className="h-7 w-7 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-100">
                  {language === 'cn' ? '衡信' : 'VeriCred'}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono border border-cyan-900">
                  PLATFORM
                </span>
              </div>
              <p className="text-[9px] text-slate-500 font-mono tracking-wider">
                {t.brandTagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Link Toggles */}
          <nav className="hidden lg:flex space-x-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveSection(item.id);
                  // Scroll to section smoothly
                  const el = document.getElementById(item.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Tech Nodes State Monitor & Lang Selector */}
          <div className="flex items-center gap-4">
            
            {/* Live Clock HUD */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-900 font-mono text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-cyan-500" />
              <span>{currentTime}</span>
            </div>

            {/* Admin Backstage Switch */}
            <button
              onClick={toggleAdminMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                isAdminMode
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-800 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
              title={language === 'cn' ? '切换管理员模式' : 'Toggle Admin Mode'}
            >
              <Settings className="h-3.5 w-3.5 animate-[spin_10s_linear_infinite]" />
              <span className="hidden sm:inline">{language === 'cn' ? '后台模式' : 'Admin Mode'}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${isAdminMode ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`}></span>
            </button>

            {/* Micro cloud node health monitor */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-850">
              <div className="relative h-2 w-2">
                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping"></div>
                <div className="relative h-2 w-2 rounded-full bg-emerald-500"></div>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                CF_EDGE: <span className="text-emerald-400 font-bold">{t.statusActive}</span>
              </span>
            </div>

            {/* Language Dropdown Selector */}
            <div className="relative inline-block text-left" id="nav-lang-dropdown">
              <div>
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-slate-100 border border-slate-800 transition-all focus:outline-none cursor-pointer"
                  id="nav-lang-menu-button"
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
                  {/* Backdrop overlay to handle clicking outside */}
                  <div className="fixed inset-0 z-30" onClick={() => setIsLangOpen(false)} />
                  <div 
                    className={`absolute ${language === 'fa' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} mt-2 w-36 rounded-lg bg-slate-950 border border-slate-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-40 animate-[fadeIn_0.15s_ease-out]`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="nav-lang-menu-button"
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
      </div>
    </header>
  );
}
