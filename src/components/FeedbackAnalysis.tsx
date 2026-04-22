import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { temperatureFeedbacks, customers } from '../data/mockData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function FeedbackAnalysis() {
  const total = temperatureFeedbacks.length;
  const hot    = temperatureFeedbacks.filter(f => f.feedback === '덥다').length;
  const cold   = temperatureFeedbacks.filter(f => f.feedback === '춥다').length;
  const perfect = temperatureFeedbacks.filter(f => f.feedback === '적당했다').length;

  const stats = [
    { name:'덥다',    count: hot,    pct: ((hot/total)*100).toFixed(1),    icon: TrendingUp,   bg:'bg-red-50',   iconBg:'bg-red-500',   text:'text-red-600' },
    { name:'춥다',    count: cold,   pct: ((cold/total)*100).toFixed(1),   icon: TrendingDown, bg:'bg-blue-50',  iconBg:'bg-blue-500',  text:'text-blue-600' },
    { name:'적당했다', count: perfect, pct: ((perfect/total)*100).toFixed(1), icon: Minus,     bg:'bg-green-50', iconBg:'bg-green-500', text:'text-green-600' },
  ];

  // 온도 구간별
  const tempMap: Record<string, Record<string, number>> = {};
  temperatureFeedbacks.forEach(f => {
    const range = `${Math.floor(f.actualTemp/5)*5}~${Math.floor(f.actualTemp/5)*5+5}°C`;
    if (!tempMap[range]) tempMap[range] = { '덥다':0, '춥다':0, '적당했다':0 };
    tempMap[range][f.feedback]++;
  });
  const tempData = Object.entries(tempMap)
    .map(([range, v]) => ({ range, ...v }))
    .sort((a,b) => parseInt(a.range) - parseInt(b.range));

  // 지역(시)별
  const cityMap: Record<string, Record<string, number>> = {};
  temperatureFeedbacks.forEach(f => {
    const city = f.location.split(' ')[0];
    if (!cityMap[city]) cityMap[city] = { '덥다':0, '춥다':0, '적당했다':0 };
    cityMap[city][f.feedback]++;
  });
  const cityData = Object.entries(cityMap).map(([city, v]) => ({ city, ...v }));

  const pieData = [
    { name:'덥다',    value: hot,    color:'#ef4444' },
    { name:'춥다',    value: cold,   color:'#3b82f6' },
    { name:'적당했다', value: perfect, color:'#10b981' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">온도 피드백 분석</h1>
        <p className="text-gray-500 text-sm">고객이 느끼는 체감 온도 분석</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.name} className={`${s.bg} rounded-xl p-5 border border-gray-200`}>
              <div className="flex justify-between items-center mb-3">
                <div className={`${s.iconBg} p-2.5 rounded-lg text-white`}><Icon size={18} /></div>
                <span className={`text-xl font-bold ${s.text}`}>{s.pct}%</span>
              </div>
              <p className="text-sm text-gray-600">{s.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{s.count}건</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">전체 피드백 분포</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">지역(시)별 피드백</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="덥다"    fill="#ef4444" stackId="a" />
              <Bar dataKey="적당했다" fill="#10b981" stackId="a" />
              <Bar dataKey="춥다"    fill="#3b82f6" stackId="a" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">온도 구간별 피드백 분포</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={tempData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="range" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="덥다"    fill="#ef4444" stackId="a" />
            <Bar dataKey="적당했다" fill="#10b981" stackId="a" />
            <Bar dataKey="춥다"    fill="#3b82f6" stackId="a" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 피드백 상세</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                {['날짜','고객','지역','실제온도','체감온도','날씨','피드백'].map(h => (
                  <th key={h} className="text-left py-3 px-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {temperatureFeedbacks.sort((a,b) => b.date.localeCompare(a.date)).map(f => {
                const c = customers.find(c => c.id === f.customerId);
                return (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3">{f.date}</td>
                    <td className="py-2.5 px-3 font-medium">{c?.name}</td>
                    <td className="py-2.5 px-3 text-gray-500">{f.location}</td>
                    <td className="py-2.5 px-3">{f.actualTemp}°C</td>
                    <td className="py-2.5 px-3">{f.feelsLikeTemp}°C</td>
                    <td className="py-2.5 px-3 text-gray-500">{f.weatherCondition}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${f.feedback === '적당했다' ? 'bg-green-100 text-green-800' : f.feedback === '덥다' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {f.feedback}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
