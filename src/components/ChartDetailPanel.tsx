import { X, Table2, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';

export interface DetailData {
  title: string;
  subtitle?: string;
  color?: string;       // 포인트 컬러 (hex)
  columns: string[];
  rows: Record<string, string | number>[];
}

const ANIMATION_CSS = `
  @keyframes wf-slide-in {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  @keyframes wf-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

export function ChartDetailPanel({
  data,
  onClose,
}: {
  data: DetailData | null;
  onClose: () => void;
}) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!data) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [data, onClose]);

  if (!data) return null;

  const accent = data.color ?? '#3b82f6';
  const accentLight = accent + '18';
  const accentMid   = accent + '30';

  return (
    <>
      <style>{ANIMATION_CSS}</style>

      {/* 오버레이 */}
      <div
        className="fixed inset-0 z-50 flex justify-end"
        style={{ animation: 'wf-fade-in 0.18s ease-out' }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />

        {/* 패널 */}
        <div
          className="relative w-[580px] max-w-[92vw] h-full bg-white shadow-2xl flex flex-col overflow-hidden"
          style={{ animation: 'wf-slide-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* 상단 포인트 바 */}
          <div className="h-[3px] w-full shrink-0" style={{ backgroundColor: accent }} />

          {/* 헤더 */}
          <div className="px-6 py-4 flex items-start justify-between gap-4 border-b border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: accentLight }}
              >
                <TrendingUp size={18} style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-base leading-snug">{data.title}</h3>
                {data.subtitle && (
                  <p className="text-xs text-gray-400 mt-0.5">{data.subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0 mt-0.5"
              title="닫기 (Esc)"
            >
              <X size={16} />
            </button>
          </div>

          {/* 요약 바 */}
          <div className="px-6 py-2.5 border-b border-gray-100 flex items-center gap-2 flex-wrap bg-gray-50/60">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: accentLight, color: accent }}
            >
              <Table2 size={11} />
              총 {data.rows.length.toLocaleString()}건
            </span>
            {data.columns.map(col => (
              <span
                key={col}
                className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-500 text-xs"
              >
                {col}
              </span>
            ))}
          </div>

          {/* 테이블 바디 */}
          <div className="flex-1 overflow-y-auto">
            {data.rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Table2 size={30} />
                </div>
                <p className="text-sm text-gray-400">데이터가 없습니다</p>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="bg-gray-50 border-b border-gray-100 px-4 py-3 text-left text-[11px] font-semibold text-gray-400 w-10 select-none">
                      No
                    </th>
                    {data.columns.map(col => (
                      <th
                        key={col}
                        className="bg-gray-50 border-b border-gray-100 px-4 py-3 text-left text-[11px] font-semibold text-gray-500 whitespace-nowrap select-none"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 transition-colors hover:bg-blue-50/30"
                      style={i % 2 === 1 ? { backgroundColor: '#f9fafb' } : {}}
                    >
                      <td className="px-4 py-2.5 text-[11px] text-gray-300 font-mono tabular-nums select-none">
                        {i + 1}
                      </td>
                      {data.columns.map(col => {
                        const val = row[col];
                        const isAmt = typeof val === 'string' && val.startsWith('₩');
                        const isTemp = typeof val === 'string' && val.endsWith('°C');
                        return (
                          <td
                            key={col}
                            className={`px-4 py-2.5 text-xs whitespace-nowrap ${
                              isAmt  ? 'font-semibold text-gray-800' :
                              isTemp ? 'text-blue-600 font-medium' :
                              'text-gray-700'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 풋터 */}
          <div
            className="px-6 py-2.5 border-t flex items-center justify-between"
            style={{ borderColor: accentMid, backgroundColor: accentLight }}
          >
            <span className="text-xs font-medium" style={{ color: accent }}>
              {data.rows.length.toLocaleString()}개 항목
            </span>
            <span className="text-[10px] text-gray-400">
              배경 클릭 또는 <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-sans">Esc</kbd> 로 닫기
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
