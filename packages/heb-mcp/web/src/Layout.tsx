import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4]">
      {/* Header */}
      <header className="bg-heb-red text-white py-3 shadow-md sticky top-0 z-10 w-full">
        <div className="max-w-[1240px] mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 select-none">
                <div className="bg-white text-heb-red font-black px-2 py-0.5 text-xl tracking-tighter border-2 border-white rounded-sm inline-flex items-center justify-center italic" style={{ fontFamily: 'Arial, sans-serif' }}>
                   H-E-B
                </div>
                <span className="font-semibold text-white/90 tracking-wide text-sm ml-2 border-l border-white/30 pl-3">
                   MCP
                </span>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#333333] text-white py-6 mt-auto">
        <div className="max-w-[1240px] mx-auto px-4 text-center">
            <p className="text-white/60 text-xs">
                This application is an <strong>unofficial</strong> tool and is not associated with, endorsed by, or affiliated with H-E-B.
            </p>
             <p className="text-white/40 text-[10px] mt-2">
                H-E-B trademarks are the property of H-E-B, LP.
            </p>
        </div>
      </footer>
    </div>
  );
}
