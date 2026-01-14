import { CheckCircle2 } from 'lucide-react';

export default function AuthSuccess() {
  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] min-h-screen flex items-center justify-center text-white font-['Inter',sans-serif] p-4">
      <div className="text-center p-8 max-w-[480px]">
        <div className="w-20 h-20 bg-gradient-to-br from-[#00c853] to-[#69f0ae] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_4px_20px_rgba(0,200,83,0.3)] animate-bounce-slow">
          <CheckCircle2 className="w-10 h-10 text-white stroke-[3]" />
        </div>
        <h1 className="text-3xl font-extrabold mb-3 tracking-tight">Successfully Signed In</h1>
        <p className="text-white/70 text-lg leading-relaxed">You're now authenticated with the HEB MCP server.</p>
        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
          <p className="text-sm font-medium text-white/90">You can close this tab and return to the extension to sync your cookies.</p>
        </div>
      </div>
    </div>
  );
}
