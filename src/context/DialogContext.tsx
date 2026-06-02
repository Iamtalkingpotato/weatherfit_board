import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, HelpCircle, Trash2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DialogConfig {
  type: 'alert' | 'confirm';
  title?: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
  resolve: (value: boolean) => void;
}

interface DialogContextValue {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, options?: {
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }) => Promise<boolean>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DialogCtx = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [cfg, setCfg] = useState<DialogConfig | null>(null);

  const alert = useCallback((message: string, title?: string): Promise<void> =>
    new Promise(resolve => setCfg({
      type: 'alert', message, title,
      confirmLabel: '확인', cancelLabel: '취소',
      destructive: false,
      resolve: () => resolve(true),
    })), []);

  const confirm = useCallback((message: string, opts?: {
    title?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean;
  }): Promise<boolean> =>
    new Promise(resolve => setCfg({
      type: 'confirm', message,
      title: opts?.title,
      confirmLabel: opts?.confirmLabel ?? '확인',
      cancelLabel: opts?.cancelLabel ?? '취소',
      destructive: opts?.destructive ?? false,
      resolve,
    })), []);

  const close = (val: boolean) => { cfg?.resolve(val); setCfg(null); };

  return (
    <DialogCtx.Provider value={{ alert, confirm }}>
      {children}
      {cfg && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[500] p-4"
          onClick={() => cfg.type === 'alert' ? close(true) : close(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            {/* 아이콘 + 내용 */}
            <div className="flex flex-col items-center pt-8 pb-2 px-6 text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                cfg.destructive ? 'bg-red-100' :
                cfg.type === 'alert' ? 'bg-amber-100' : 'bg-blue-100'
              }`}>
                {cfg.type === 'alert' ? (
                  <AlertTriangle size={28} className="text-amber-500" />
                ) : cfg.destructive ? (
                  <Trash2 size={28} className="text-red-500" />
                ) : (
                  <HelpCircle size={28} className="text-blue-500" />
                )}
              </div>

              {cfg.title && (
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{cfg.title}</h3>
              )}
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed pb-6">
                {cfg.message}
              </p>
            </div>

            {/* 버튼 */}
            <div className={`flex border-t border-gray-100 ${cfg.type === 'confirm' ? 'divide-x divide-gray-100' : ''}`}>
              {cfg.type === 'confirm' && (
                <button
                  onClick={() => close(false)}
                  className="flex-1 py-4 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors rounded-bl-2xl"
                >
                  {cfg.cancelLabel}
                </button>
              )}
              <button
                autoFocus
                onClick={() => close(true)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  cfg.type === 'alert' ? 'rounded-b-2xl' : 'rounded-br-2xl'
                } ${
                  cfg.destructive
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                {cfg.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogCtx.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogCtx);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
}
