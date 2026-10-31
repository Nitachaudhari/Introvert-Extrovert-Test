import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          <p>© {new Date().getFullYear()} Psychometric Assessment Management System. Phase 1 Technical Foundation.</p>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>React 18 + Vite</span>
          <span>•</span>
          <span>Node.js + Express</span>
          <span>•</span>
          <span>MongoDB Atlas</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

