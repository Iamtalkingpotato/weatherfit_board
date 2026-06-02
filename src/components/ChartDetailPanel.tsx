import { X, Table2, TrendingUp, Search } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

export interface DetailData {
  title: string;
  subtitle?: string;
  color?: string;
  wide?: boolean;
  columns: string[];
  rows: Record<string, string | number>[];
  filters?: {
    label: string;
    column: string;
    value: string | number;
    color?: string;
  }[];
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

const PAGE_SIZE = 50;

export function ChartDetailPanel({
  data,
  onClose,
}: {
  data: DetailData | null;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setQuery('');
    setActiveFilter(null);
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [data, onClose]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const filter = data.filters?.find(f => f.label === activeFilter);
    const filterRows = filter
      ? data.rows.filter(row => String(row[filter.column] ?? '') === String(filter.value))
      : data.rows;
    const q = query.trim().toLowerCase();
    if (!q) return filterRows;
    return filterRows.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    );
  }, [data, activeFilter, query]);

  const displayed = filtered.slice(0, PAGE_SIZE);

  if (!data) return null;

  const baseAccent  = data.color ?? '#3b82f6';
  const filterColor = data.filters?.find(f => f.label === activeFilter)?.color;
  const accent      = filterColor ?? baseAccent;
  const accentLight = accent + '18';
  const accentMid   = accent + '30';
  const total       = data.rows.length;

  return (
    <>
      <style>{ANIMATION_CSS}</style>

      <div
        className="fixed inset-0 z-50 flex justify-end"
        style={{ animation: 'wf-fade-in 0.18s ease-out' }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />

        <div
          className={`relative ${data.wide ? 'w-[860px] max-w-[96vw]' : 'w-[580px] max-w-[92vw]'} h-full bg-white shadow-2xl flex flex-col overflow-hidden`}
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

          {/* 요약 + 검색 바 */}
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0"
                style={{ backgroundColor: accentLight, color: accent }}
              >
                <Table2 size={11} />
                총 {total.toLocaleString()}건
              </span>
            </div>
            {/* 검색창 */}
            {data.filters && data.filters.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveFilter(null)}
                  className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                    activeFilter === null
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  전체
                </button>
                {data.filters.map(filter => {
                  const selected = activeFilter === filter.label;
                  return (
                    <button
                      key={filter.label}
                      type="button"
                      onClick={() => setActiveFilter(filter.label)}
                      className="px-3 py-1 rounded-full border text-xs font-semibold transition-colors"
                      style={{
                        borderColor: selected ? (filter.color ?? accent) : '#e5e7eb',
                        backgroundColor: selected ? (filter.color ?? accent) : '#ffffff',
                        color: selected ? '#ffffff' : '#6b7280',
                      }}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`검색 가능: ${data.columns.join(', ')}`}
                className="flex-1 text-xs outline-none placeholder:text-gray-300 bg-transparent"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* 테이블 바디 */}
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Search size={28} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">
                  {query ? `"${query}"에 해당하는 결과가 없습니다` : '데이터가 없습니다'}
                </p>
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
                  {displayed.map((row, i) => (
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
                        const isAmt  = typeof val === 'string' && val.startsWith('₩');
                        const isTemp = typeof val === 'string' && val.endsWith('°C');
                        const str    = String(val ?? '');
                        const q      = query.trim().toLowerCase();
                        const idx    = q ? str.toLowerCase().indexOf(q) : -1;

                        return (
                          <td
                            key={col}
                            className={`px-4 py-2.5 text-xs whitespace-nowrap ${
                              isAmt  ? 'font-semibold text-gray-800' :
                              isTemp ? 'text-blue-600 font-medium' :
                              'text-gray-700'
                            }`}
                          >
                            {idx >= 0 ? (
                              <>
                                {str.slice(0, idx)}
                                <mark className="bg-yellow-200 text-gray-900 rounded-sm">
                                  {str.slice(idx, idx + q.length)}
                                </mark>
                                {str.slice(idx + q.length)}
                              </>
                            ) : str}
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
            className="px-6 py-2.5 border-t flex items-center justify-between gap-2"
            style={{ borderColor: accentMid, backgroundColor: accentLight }}
          >
            <span className="text-xs font-medium" style={{ color: accent }}>
              {query
                ? `${filtered.length.toLocaleString()}건 검색됨 · 상위 ${Math.min(displayed.length, PAGE_SIZE)}건 표시`
                : `상위 ${Math.min(displayed.length, PAGE_SIZE)}건 표시 / 전체 ${total.toLocaleString()}건`
              }
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
