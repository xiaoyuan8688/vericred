import React, { useState, useEffect } from 'react';
import SplashPage from './components/SplashPage';
import Navbar from './components/Navbar';
import MainPortal from './components/MainPortal';
import { Language } from './types';
import { preloadAllContent } from './services/contentLoader';

export default function App() {
  const [language, setLanguage] = useState<Language>('cn');
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return localStorage.getItem('vericred_admin_mode') === 'true';
  });

  // 启动时预加载 CMS 数据（供应商 / 商家 / 供需匹配）
  useEffect(() => {
    preloadAllContent().catch((err) =>
      console.warn('[App] 内容预加载未完成，使用内置数据:', err)
    );
  }, []);

  const toggleAdminMode = () => {
    const nextVal = !isAdminMode;
    setIsAdminMode(nextVal);
    localStorage.setItem('vericred_admin_mode', String(nextVal));
  };

  // Handle ESC key to skip animation instantly as a developer convenience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSplash) {
        setShowSplash(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSplash]);

  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {showSplash ? (
        <SplashPage 
          language={language} 
          setLanguage={setLanguage} 
          onEnter={() => setShowSplash(false)} 
        />
      ) : (
        <div className="animate-[fadeIn_0.5s_ease-out]">
          <Navbar 
            language={language} 
            setLanguage={setLanguage} 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
            isAdminMode={isAdminMode}
            toggleAdminMode={toggleAdminMode}
          />
          <MainPortal 
            language={language} 
            setLanguage={setLanguage} 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isAdminMode={isAdminMode}
            toggleAdminMode={toggleAdminMode}
            onShowIntro={() => {
              setShowSplash(true);
              setActiveSection('hero');
            }}
          />
        </div>
      )}
    </div>
  );
}
