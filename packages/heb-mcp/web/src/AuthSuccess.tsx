import { CheckCircle2 } from 'lucide-react';

export default function AuthSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-10 h-10 text-[#008148]" />
        </div>
        <h1 className="text-3xl font-bold text-heb-gray mb-3">Successfully Signed In</h1>
        <p className="text-ink-light text-lg mb-8 max-w-md">
            You have successfully authenticated with the HEB MCP server.
        </p>
        
        <div className="card bg-gray-50 border-gray-200 max-w-md w-full">
            <p className="text-sm font-medium text-gray-600">
                 You can now close this tab and return to the extension to verify your session.
            </p>
        </div>
    </div>
  );
}
