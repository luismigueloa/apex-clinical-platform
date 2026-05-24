'use client';
import { useState } from 'react';
import { Users, FileText, Phone, AlertTriangle, CheckCircle, Clock, Sparkles, ArrowRight } from 'lucide-react';

const dischargeQueue = [
  { id: 'P04', name: 'Margaret T.', room: '114A', daysLeft: 2, destination: 'Home with HH', guardian: 'Son — James T. (410-555-0192)', barriers: ['Insurance auth pending', 'Home safety eval needed'], status: 'urgent' },
  { id: 'P19', name: 'Robert K.', room: '208B', daysLeft: 5, destination: 'Long Term Care', guardian: 'Daughter — Lisa K. (443-555-0317)', barriers: ['Medicaid pending — 3 weeks out'], status: 'warning' },
  { id: 'P08', name: 'Dorothy M.', room: '301C', daysLeft: 12, destination: 'ALF', guardian: 'Self', barriers: [], status: 'ok' },
  { id: 'P33', name: 'Frank S.', room: '115A', daysLeft: 7, destination: 'Home', guardian: 'Wife — Helen S. (410-555-0841)', barriers: ['PT not yet recommending home'], status: 'warning' },
];

const abuseScreenings = [
  { id: 'P11', name: 'Alice B.', room: '202A', due: 'Overdue 3 days', type: 'Annual', status: 'overdue' },
  { id: 'P27', name: 'Henry L.', room: '118B', due: 'Due in 2 days', type: 'Admission', status: 'due-soon' },
  { id: 'P44', name: 'Norma F.', room: '309A', due: 'Due in 7 days', type: 'Annual', status: 'upcoming' },
];

const advanceDirectives = [
  { id: 'P07', name: 'Walter P.', room: '210C', directive: 'DNR — on file', updated: '2024-01-15', current: true },
  { id: 'P22', name: 'Sandra M.', room: '107B', directive: 'MOLST missing', updated: null, current: false },
  { id: 'P38', name: 'George T.', room: '305A', directive: 'Full Code', updated: '2023-06-02', current: false },
];

export default function SocialWorkPage() {
  const [aiTask, setAiTask] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const runAI = async (prompt: string) => {
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: 'social_work', task: prompt }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error || 'No response');
    } catch {
      setAiResult('AI service unavailable. Check backend connection.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Social Work</h2>
          <p className="text-sm text-text-muted mt-1">Discharge planning, advance directives, abuse screenings, family coordination</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">1 Overdue Screening</span>
          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">2 Urgent Discharges</span>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="card border-l-4 border-l-purple-400">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" /> AI Social Work Assistant
        </h3>
        <div className="flex gap-2 flex-wrap mb-3">
          {['Draft discharge summary for Margaret T.', 'Create family meeting agenda for Robert K.', 'List barriers to discharge for all patients', 'Draft MOLST conversation guide'].map(q => (
            <button key={q} onClick={() => runAI(q)}
              className="text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded-full px-3 py-1 hover:bg-purple-100 transition-colors">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={aiTask} onChange={e => setAiTask(e.target.value)}
            placeholder="Ask the AI anything about your caseload…"
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-purple-400"
            onKeyDown={e => e.key === 'Enter' && runAI(aiTask)}
          />
          <button onClick={() => runAI(aiTask)} disabled={!aiTask || aiLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
            {aiLoading ? '…' : 'Ask'}
          </button>
        </div>
        {aiResult && (
          <div className="mt-3 p-3 bg-purple-50 rounded-md text-sm text-text-primary whitespace-pre-wrap border border-purple-100">
            {aiResult}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Discharge Queue */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-data-blue" /> Discharge Planning Queue
          </h3>
          <div className="space-y-3">
            {dischargeQueue.map(p => (
              <div key={p.id} className={`p-3 rounded-lg border ${p.status === 'urgent' ? 'border-red-200 bg-red-50' : p.status === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-border bg-gray-50'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{p.name} — Room {p.room}</span>
                  <span className={`text-xs font-mono font-bold ${p.status === 'urgent' ? 'text-risk-high' : p.status === 'warning' ? 'text-risk-medium' : 'text-risk-low'}`}>{p.daysLeft}d left</span>
                </div>
                <div className="text-xs text-text-muted mb-1">→ {p.destination} &nbsp;|&nbsp; {p.guardian}</div>
                {p.barriers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.barriers.map(b => (
                      <span key={b} className="text-[10px] bg-white border border-orange-200 text-orange-700 rounded px-1.5 py-0.5">{b}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Abuse Screenings */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-risk-medium" /> Abuse & Neglect Screenings
            </h3>
            <div className="space-y-2">
              {abuseScreenings.map(s => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{s.name}</span>
                    <span className="text-text-muted text-xs ml-2">Room {s.id.slice(1)} — {s.type}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    s.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    s.status === 'due-soon' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>{s.due}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advance Directives */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-data-blue" /> Advance Directives
            </h3>
            <div className="space-y-2">
              {advanceDirectives.map(d => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{d.name}</span>
                    <span className="text-text-muted text-xs ml-2">Room {d.room}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {d.current ? <CheckCircle className="h-3 w-3 text-risk-low" /> : <AlertTriangle className="h-3 w-3 text-risk-high" />}
                    <span className={`text-xs ${d.current ? 'text-risk-low' : 'text-risk-high font-semibold'}`}>{d.directive}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
