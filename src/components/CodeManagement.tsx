import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Edit2, Trash2, Code2, X, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, ArrowLeft } from 'lucide-react';
import { useCodeContext, Field, FieldOption, INITIAL_FIELDS, FIXED_FILTER_SUBJECT } from '../context/CodeContext';
import { useDialog } from '../context/DialogContext';
import { AVAILABLE_CUSTOMER_FIELDS } from '../data/customerFields';

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Field Modal ──────────────────────────────────────────────────────────────

function FieldModal({
  initial,
  existingIds,
  nextFieldNo,
  subjectOptions,
  onSave,
  onClose,
}: {
  initial: Field | null;
  existingIds: string[];
  nextFieldNo: number;
  subjectOptions: string[];
  onSave: (f: Field) => void;
  onClose: () => void;
}) {
  const [fieldId,       setFieldId]       = useState(initial?.id            ?? '');
  const [label,         setLabel]         = useState(initial?.label         ?? '');
  const [dataType,      setDataType]      = useState<Field['dataType']>(initial?.dataType ?? 'number');
  const [filterSubject, setFilterSubject] = useState(initial?.filterSubject ?? '고객정보');

  const fieldCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400';
  const dialog = useDialog();

  // 추가 모드에서 드롭다운 선택 시 label / dataType 자동 채우기
  const handleFieldSelect = (id: string) => {
    setFieldId(id);
    const def = AVAILABLE_CUSTOMER_FIELDS.find(f => f.id === id);
    if (def) {
      setLabel(def.label);
      setDataType(def.dataType);
    }
  };

  const handleSave = async () => {
    const trimId = fieldId.trim();
    if (!trimId)       { await dialog.alert('필드 ID를 선택하세요.'); return; }
    if (!label.trim()) { await dialog.alert('표시명을 입력하세요.'); return; }
    if (!initial && existingIds.includes(trimId)) {
      await dialog.alert('이미 등록된 필드 ID입니다.', '중복 오류'); return;
    }
    const baseField = INITIAL_FIELDS.find(f => f.id === trimId);
    onSave({
      fieldNo:       initial?.fieldNo ?? nextFieldNo,
      id:            trimId,
      label:         label.trim(),
      dataType,
      selectOptions: initial?.selectOptions ?? baseField?.selectOptions ?? (dataType === 'select' ? [] : undefined),
      active:        initial?.active ?? false,
      filterSubject: filterSubject || '고객정보',
    });
  };

  // 드롭다운에서 이미 등록된 필드 제외 (수정 모드에서는 전체 표시)
  const availableOptions = initial
    ? AVAILABLE_CUSTOMER_FIELDS
    : AVAILABLE_CUSTOMER_FIELDS.filter(f => !existingIds.includes(f.id));

  return (
    <Modal title={initial ? '필드 수정' : '새 필드 추가'} onClose={onClose}>
      <div className="space-y-4">

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            필드 ID <span className="text-red-400">*</span>
          </label>
          {initial ? (
            <input
              value={fieldId}
              disabled
              className={`${fieldCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
            />
          ) : (
            <select
              value={fieldId}
              onChange={e => handleFieldSelect(e.target.value)}
              autoFocus
              className={fieldCls}
            >
              <option value="" disabled hidden>-- 필드를 선택하세요 --</option>
              {availableOptions.map(f => (
                <option key={f.id} value={f.id}>{f.id} ({f.label})</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            표시명 <span className="text-red-400">*</span>
          </label>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="캠페인 필터에 표시될 이름 (예: 가입일)"
            autoFocus={!!initial}
            className={fieldCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">데이터 타입</label>
          <div className="flex gap-4 mt-1 flex-wrap">
            {(['number', 'date', 'string', 'select'] as const).map(t => (
              <label key={t} className={`flex items-center gap-1.5 text-sm cursor-pointer ${dataType === t ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                <input
                  type="radio"
                  value={t}
                  checked={dataType === t}
                  onChange={() => setDataType(t)}
                  disabled={!!initial || !!fieldId}
                />
                {t === 'number' ? '숫자' : t === 'date' ? '날짜' : t === 'string' ? '텍스트' : '선택형'}
              </label>
            ))}
          </div>
          {(!!initial || !!fieldId) && (
            <p className="text-[11px] text-gray-400 mt-1">타입은 필드 선택 시 자동으로 결정됩니다.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">필터 주제</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {subjectOptions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSubject(s)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  filterSubject === s
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">캠페인 필터 탭에서 이 주제 아래에 표시됩니다.</p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">취소</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">저장</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Option Modal ─────────────────────────────────────────────────────────────

function OptionModal({
  initial,
  nextValue,
  onSave,
  onClose,
}: {
  initial: FieldOption | null;
  nextValue: number;
  onSave: (o: FieldOption) => void;
  onClose: () => void;
}) {
  const [codeValue, setCodeValue] = useState(String(initial?.codeValue ?? nextValue));
  const [codeName,  setCodeName]  = useState(initial?.codeName ?? '');
  const [codeEng,   setCodeEng]   = useState(initial?.codeEng  ?? '');

  const fieldCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400';
  const dialog = useDialog();

  const handleSave = async () => {
    const val = Number(codeValue);
    if (!codeValue.trim() || isNaN(val)) { await dialog.alert('코드값을 숫자로 입력하세요.'); return; }
    if (!codeName.trim()) { await dialog.alert('코드명(한글)을 입력하세요.'); return; }
    if (!codeEng.trim())  { await dialog.alert('코드명(영문)을 입력하세요.'); return; }
    onSave({ codeValue: val, codeName: codeName.trim(), codeEng: codeEng.trim() });
  };

  return (
    <Modal title={initial ? '옵션 수정' : '새 옵션 추가'} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            코드값 <span className="text-red-400">*</span>
            <span className="text-gray-400 ml-1 font-normal">(수동 변경 가능)</span>
          </label>
          <input
            type="number"
            value={codeValue}
            onChange={e => setCodeValue(e.target.value)}
            className={fieldCls}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">코드명(한글) <span className="text-red-400">*</span></label>
          <input value={codeName} onChange={e => setCodeName(e.target.value)} placeholder="예) 남성" className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">코드명(영문) <span className="text-red-400">*</span></label>
          <input value={codeEng} onChange={e => setCodeEng(e.target.value)} placeholder="예) MALE" className={fieldCls} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">취소</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">저장</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Type helpers ─────────────────────────────────────────────────────────────

const DT_LABEL: Record<string, string> = { number: '숫자', date: '날짜', string: '텍스트', select: '선택형' };
const DT_COLOR: Record<string, string> = {
  number: 'bg-blue-100 text-blue-700',
  date:   'bg-green-100 text-green-700',
  string: 'bg-orange-100 text-orange-700',
  select: 'bg-purple-100 text-purple-700',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CodeManagement() {
  const { fields, setFields, filterSubjects, setFilterSubjects } = useCodeContext();
  const navigate = useNavigate();
  const dialog = useDialog();

  const [expandedId,    setExpandedId]    = useState<string | null>(null);
  const [fieldModal,    setFieldModal]    = useState<{ mode: 'add' | 'edit'; field?: Field } | null>(null);
  const [optionModal,   setOptionModal]   = useState<{ fieldId: string; option?: FieldOption } | null>(null);
  const [newSubject,    setNewSubject]    = useState('');
  const [editSubject,   setEditSubject]   = useState<{ idx: number; value: string } | null>(null);

  const nextFieldNo = fields.length > 0 ? Math.max(...fields.map(f => f.fieldNo)) + 1 : 1;

  // ── 필드 핸들러 ────────────────────────────────────────────────────────────

  const handleSaveField = (field: Field) => {
    setFields(prev =>
      prev.some(f => f.fieldNo === field.fieldNo)
        ? prev.map(f => f.fieldNo === field.fieldNo ? field : f)
        : [...prev, field]
    );
    setFieldModal(null);
  };

  const handleDeleteField = async (field: Field) => {
    const msg = field.active
      ? `"${field.label}" 필드는 현재 캠페인 필터에서 활성 상태입니다.\n삭제하면 필터에서도 제거됩니다.`
      : `"${field.label}" 필드를 삭제하시겠습니까?`;
    const ok = await dialog.confirm(msg, { title: '필드 삭제', confirmLabel: '삭제', destructive: true });
    if (!ok) return;
    setFields(prev => prev.filter(f => f.fieldNo !== field.fieldNo));
    if (expandedId === field.id) setExpandedId(null);
  };

  const handleToggleActive = (fieldId: string) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, active: !f.active } : f));
  };

  // ── 옵션 핸들러 ────────────────────────────────────────────────────────────

  const handleSaveOption = (fieldId: string, option: FieldOption) => {
    setFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      const opts = f.selectOptions ?? [];
      const exists = opts.some(o => o.codeValue === option.codeValue);
      return {
        ...f,
        selectOptions: exists
          ? opts.map(o => o.codeValue === option.codeValue ? option : o)
          : [...opts, option].sort((a, b) => a.codeValue - b.codeValue),
      };
    }));
    setOptionModal(null);
  };

  const handleDeleteOption = async (fieldId: string, codeValue: number) => {
    const ok = await dialog.confirm('이 옵션을 삭제하시겠습니까?', { title: '옵션 삭제', confirmLabel: '삭제', destructive: true });
    if (!ok) return;
    setFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      return { ...f, selectOptions: (f.selectOptions ?? []).filter(o => o.codeValue !== codeValue) };
    }));
  };

  // ── 필터 주제 핸들러 ────────────────────────────────────────────────────────

  const handleAddSubject = () => {
    const trimmed = newSubject.trim();
    if (!trimmed || filterSubjects.includes(trimmed)) return;
    setFilterSubjects([...filterSubjects, trimmed]);
    setNewSubject('');
  };

  const handleDeleteSubject = async (subject: string) => {
    if (subject === FIXED_FILTER_SUBJECT) return; // "기타"는 삭제 불가
    const usedCount = fields.filter(f => f.filterSubject === subject).length;
    const msg = usedCount > 0
      ? `"${subject}"을(를) 삭제하면 이 주제를 사용 중인 ${usedCount}개 필드가 "${FIXED_FILTER_SUBJECT}"로 변경됩니다. 삭제하시겠습니까?`
      : `"${subject}" 주제를 삭제하시겠습니까?`;
    const ok = await dialog.confirm(msg, { title: '주제 삭제', confirmLabel: '삭제', destructive: true });
    if (!ok) return;
    setFilterSubjects(filterSubjects.filter(s => s !== subject));
    if (usedCount > 0) {
      setFields(prev => prev.map(f => f.filterSubject === subject ? { ...f, filterSubject: FIXED_FILTER_SUBJECT } : f));
    }
  };

  const handleRenameSubject = (idx: number, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || (filterSubjects.includes(trimmed) && filterSubjects[idx] !== trimmed)) return;
    const oldName = filterSubjects[idx];
    const updated = filterSubjects.map((s, i) => i === idx ? trimmed : s);
    setFilterSubjects(updated);
    if (oldName !== trimmed) {
      setFields(prev => prev.map(f => f.filterSubject === oldName ? { ...f, filterSubject: trimmed } : f));
    }
    setEditSubject(null);
  };

  // ── 렌더 ───────────────────────────────────────────────────────────────────

  const activeCount = fields.filter(f => f.active).length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
        >
          <ArrowLeft size={15} /> 뒤로가기
        </button>
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Code2 size={22} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">필드 관리</h1>
          <p className="text-gray-500 text-sm">캠페인 필터에 사용되는 고객 데이터 필드 관리</p>
        </div>
      </div>

      {/* 필터 주제 관리 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">
            필터 주제 목록
            <span className="text-xs text-gray-400 font-normal ml-2">캠페인 필터 탭에 표시</span>
          </h2>
        </div>
        <div className="px-5 py-4 flex flex-wrap gap-2 items-center">
          {filterSubjects.map((subject, idx) => {
            const isFixed = subject === FIXED_FILTER_SUBJECT;
            return (
              <div
                key={subject}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 ${
                  isFixed
                    ? 'bg-gray-100 border border-gray-300'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                {!isFixed && editSubject?.idx === idx ? (
                  <input
                    autoFocus
                    value={editSubject.value}
                    onChange={e => setEditSubject({ idx, value: e.target.value })}
                    onBlur={() => handleRenameSubject(idx, editSubject.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameSubject(idx, editSubject.value);
                      if (e.key === 'Escape') setEditSubject(null);
                    }}
                    className="text-xs border border-blue-300 rounded px-1.5 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                ) : (
                  <span
                    className={`text-xs font-medium ${isFixed ? 'text-gray-500 cursor-default' : 'text-blue-700 cursor-pointer hover:text-blue-900'}`}
                    onDoubleClick={() => !isFixed && setEditSubject({ idx, value: subject })}
                    title={isFixed ? '기본 주제 (삭제 불가)' : '더블클릭하여 이름 변경'}
                  >
                    {subject}
                    {isFixed && <span className="ml-1 text-[10px] text-gray-400">(기본)</span>}
                  </span>
                )}
                {!isFixed && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(subject)}
                    className="text-blue-400 hover:text-red-500 ml-1 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}

          {/* 새 주제 추가 */}
          <div className="flex items-center gap-1.5">
            <input
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddSubject(); }}
              placeholder="새 주제 입력..."
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 w-28"
            />
            <button
              type="button"
              onClick={handleAddSubject}
              disabled={!newSubject.trim() || filterSubjects.includes(newSubject.trim())}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={12} /> 추가
            </button>
          </div>
        </div>
        <p className="px-5 pb-3 text-[11px] text-gray-400">더블클릭으로 이름 변경 · × 버튼으로 삭제</p>
      </div>

      {/* 필드 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">
              필드 목록
              <span className="text-xs text-gray-400 font-normal ml-2">
                전체 {fields.length}개 · 활성 {activeCount}개
              </span>
            </h2>
          </div>
          <button
            onClick={() => setFieldModal({ mode: 'add' })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={13} /> 새 필드 추가
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', '필드 ID', '표시명', '타입', '필터 주제', '옵션', '캠페인 필터 활성', '관리'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    필드가 없습니다. 새 필드를 추가하세요.
                  </td>
                </tr>
              ) : (
                fields.map(field => {
                  const isExpanded = expandedId === field.id;
                  const opts = field.selectOptions ?? [];
                  const nextOptVal = opts.length > 0 ? Math.max(...opts.map(o => o.codeValue)) + 1 : 1;

                  return (
                    <>
                      <tr
                        key={field.id}
                        className={`transition-colors ${isExpanded ? 'bg-purple-50/40' : 'hover:bg-gray-50'}`}
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                            {field.fieldNo}
                          </span>
                        </td>

                        {/* 필드 ID */}
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{field.id}</td>

                        {/* 표시명 */}
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{field.label}</td>

                        {/* 타입 */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DT_COLOR[field.dataType]}`}>
                            {DT_LABEL[field.dataType]}
                          </span>
                        </td>

                        {/* 필터 주제 — 인라인 변경 가능 */}
                        <td className="px-4 py-3">
                          <select
                            value={field.filterSubject ?? '고객정보'}
                            onChange={e => setFields(prev => prev.map(f => f.id === field.id ? { ...f, filterSubject: e.target.value } : f))}
                            className="border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                          >
                            {filterSubjects.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>

                        {/* 옵션수 (select만) */}
                        <td className="px-4 py-3">
                          {field.dataType === 'select' ? (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : field.id)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                isExpanded
                                  ? 'bg-purple-600 text-white'
                                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                              항목 {opts.length}개
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* 활성 토글 */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(field.id)}
                            className="flex items-center gap-1.5 text-xs transition-colors"
                          >
                            {field.active ? (
                              <>
                                <ToggleRight size={22} className="text-blue-500" />
                                <span className="text-blue-600 font-medium">활성</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={22} className="text-gray-400" />
                                <span className="text-gray-400">비활성</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* 관리 */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setFieldModal({ mode: 'edit', field })}
                              className="flex items-center gap-1 px-2.5 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              <Edit2 size={11} /> 수정
                            </button>
                            <button
                              onClick={() => handleDeleteField(field)}
                              className="flex items-center gap-1 px-2.5 py-1 border border-red-200 rounded text-xs text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={11} /> 삭제
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* 선택형 옵션 인라인 패널 */}
                      {isExpanded && field.dataType === 'select' && (
                        <tr key={`${field.id}-opts`} className="bg-purple-50/30">
                          <td colSpan={8} className="px-8 py-3">
                            <div className="border border-purple-200 rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-2 bg-purple-50 border-b border-purple-200">
                                <span className="text-xs font-semibold text-purple-700">
                                  {field.label} — 선택 옵션 목록
                                </span>
                                <button
                                  onClick={() => setOptionModal({ fieldId: field.id })}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700"
                                >
                                  <Plus size={11} /> 옵션 추가
                                </button>
                              </div>
                              {opts.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">옵션이 없습니다. 추가하세요.</p>
                              ) : (
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-50 border-b border-purple-100">
                                    <tr>
                                      {['코드값', '코드명(한글)', '코드명(영문)', '관리'].map(h => (
                                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-purple-100">
                                    {opts.map(opt => (
                                      <tr key={opt.codeValue} className="hover:bg-purple-50/50 transition-colors">
                                        <td className="px-4 py-2">
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold">
                                            {opt.codeValue}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2 font-medium text-gray-900">{opt.codeName}</td>
                                        <td className="px-4 py-2 font-mono text-gray-600">{opt.codeEng}</td>
                                        <td className="px-4 py-2">
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => setOptionModal({ fieldId: field.id, option: opt })}
                                              className="flex items-center gap-1 px-2 py-0.5 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50"
                                            >
                                              <Edit2 size={10} /> 수정
                                            </button>
                                            <button
                                              onClick={() => handleDeleteOption(field.id, opt.codeValue)}
                                              className="flex items-center gap-1 px-2 py-0.5 border border-red-200 rounded text-xs text-red-500 hover:bg-red-50"
                                            >
                                              <Trash2 size={10} /> 삭제
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                              <div className="px-4 py-1.5 bg-gray-50 border-t border-purple-100 text-[11px] text-gray-400">
                                총 {opts.length}개 옵션
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            총 {fields.length}개 필드 · 캠페인 필터 활성 {activeCount}개
          </div>
        </div>
      </div>

      {/* ── 모달 ──────────────────────────────────────────────────────────────── */}
      {fieldModal && (
        <FieldModal
          initial={fieldModal.field ?? null}
          existingIds={fields.map(f => f.id)}
          nextFieldNo={nextFieldNo}
          subjectOptions={filterSubjects}
          onSave={handleSaveField}
          onClose={() => setFieldModal(null)}
        />
      )}
      {optionModal && (
        <OptionModal
          initial={optionModal.option ?? null}
          nextValue={(() => {
            const f = fields.find(f => f.id === optionModal.fieldId);
            const opts = f?.selectOptions ?? [];
            return opts.length > 0 ? Math.max(...opts.map(o => o.codeValue)) + 1 : 1;
          })()}
          onSave={opt => handleSaveOption(optionModal.fieldId, opt)}
          onClose={() => setOptionModal(null)}
        />
      )}
    </div>
  );
}
