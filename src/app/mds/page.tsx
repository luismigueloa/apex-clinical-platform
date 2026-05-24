'use client';
import { useState } from 'react';
import { ClipboardList, AlertTriangle, CheckCircle, Clock, Sparkles, TrendingUp, Calendar } from 'lucide-react';

const ardCalendar = [
  { id: 'P03', name: 'Alice R.', room: '101A', ardDate: '2025-06-01', type: '5-Day', status: 'due-today', rug: 'RHC', suggestedRug: 'RHC', pdpmUpside: 0 },
  { id: 'P14', name: 'Bernard K.', room: '215B', ardDate: '2025-06-03', type: '14-Day', status: 'due-soon', rug: 'RBC', suggestedRug: 'RCA', pdpmUpside: 84 },
  { id: 'P28', name: 'Carla S.', room: '308A', ardDate: '2025-06-07', type: '30-Day', status: 'upcoming', rug: 'RLB', suggestedRug: 'RLB', pdpmUpside: 0 },
  { id: 'P39', name: 'David M.', room: '119C', ardDate: '2025-05-29', type: 'Quarterly', status: 'overdue', rug: 'RUC', suggestedRug: 'RVB', pdpmUpside: 120 },
  { id: 'P51', name: 'Evelyn T.', room: '206A', ardDate: '2025-06-10', type: 'Annual', status: 'upcoming', rug: 'RAD', suggestedRug: 'RBC', pdpmUpside: 56 },
];

const qmWatch = [
  { measure: 'Pressure Injuries (High Risk)', value: 4.2, threshold: 5.5, trend: 'down', status: 'ok' },
  { measure: 'Antipsychotic Use (No Diagnosis)', value: 12.5, threshold: 11.8, trend: 'up', status: 'warn' },
  { measure: 'Falls with Major Injury', value: 1.8, threshold: 2.0, trend: 'down', status: 'ok' },
  { measure: 'Worsening ADL Function', value: 22.1, threshold: 20.0, trend: 'up', status: 'warn' },
  { measure: 'Catheter Left in Place', value: 1.1, threshold: 2.5, trend: 'down', status: 'ok' },
  { measure: 'Urinary Tract Infections', value: 3.8, threshold: 4.5, trend: 'down', status: 'ok' },
];

const sectionGaps = [
  { section: 'Section GG (Function)', residents: ['P03', 'P14'], issue: 'Initial function scores not updated post-therapy change' },
  { section: 'Section I (Active Diagnoses)', residents: ['P28'], issue: 'Wound care diagnosis not coded — billing impact' },
  { section: 'Section N (Medications)', residents: ['P39', 'P51'], issue: 'Antipsychotic gradual dose reduction not documented' },
  { section: 'Section O (Special Treatments)', residents: ['P14'], issue: 'IV therapy days underreported' },
];

const statusColors: Record<string, string> = {
  'overdue': 'border-red-200 bg-red-50',
  'due-today': 'border-yellow-200 bg-yellow-50',
  'due-soon': 'border-blue-200 bg-blue-50',
  'upcoming': 'border-gray-200 bg-gray-50',
};
const statusLabel: Record<string, string> = {
  'overdue': 'OVERDUE',
  'due-today': 'DUE TODAY',
  'due-soon': 'Due in 2 days',
  'upcoming': 'Upcoming',
};

export default function MDSPage() {
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
        body: JSON.stringify({ department: 'mds', task: prompt }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error);
    } catch {
      setAiResult('AI service unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const totalUpside = ardCalendar.reduce((a, r) => a + r.pdpmUpside, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight">MDS Coordinator</h2>
          <p className="text-sm text-text-muted mt-1">ARD calendar, PDPM optimization, QM watch, and section gap analysis</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">1 Overdue ARD</span>
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">${totalUpside}/day PDPM upside</span>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="card border-l-4 border-l-indigo-400">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" /> AI MDS Intelligence
        </h3>
        <div className="flex gap-2 flex-wrap mb-3">
          {['Identify all PDPM coding opportunities this week', 'Explain GG scoring for Bernard K. IV therapy', 'Draft CAA for antipsychotic use concern', 'What QMs are at risk of survey citation?'].map(q => (
            <button key={q} onClick={() => runAI(q)}
              className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full px-3 py-1 hover:bg-indigo-100 transition-colors">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={aiTask} onChange={e => setAiTask(e.target.value)}
            placeholder="Ask about coding, PDPM optimization, QMs, CAA triggers…"
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-indigo-400"
            onKeyDown={e => e.key === 'Enter' && runAI(aiTask)} />
          <button onClick={() => runAI(aiTask)} disabled={!aiTask || aiLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {aiLoading ? '…' : 'Analyze'}
          </button>
        </div>
        {aiResult && (
          <div className="mt-3 p-3 bg-indigo-50 rounded-md text-sm text-text-primary whitespace-pre-wrap border border-indigo-100">{aiResult}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* ARD Calendar */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-data-blue" /> ARD Calendar — Next 14 Days
          </h3>
          <div className="space-y-2">
            {ardCalendar.map(r => (
              <div key={r.id} className={`p-3 rounded-lg border ${statusColors[r.status]}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-sm">{r.name}</span>
                    <span className="text-xs text-text-muted ml-2">Room {r.room} · {r.type}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase ${r.status === 'overdue' ? 'text-risk-high' : r.status === 'due-today' ? 'text-risk-medium' : 'text-text-muted'}`}>
                      {statusLabel[r.status]}
                    </span>
                    <div className="text-xs font-mono text-text-muted">{r.ardDate}</div>
                  </div>
                </div>
                {r.pdpmUpside > 0 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-risk-low" />
                    <span className="text-xs text-risk-low font-semibold">
                      {r.rug} → {r.suggestedRug} (+${r.pdpmUpside}/day PDPM)
                    </span>
                    <button onClick={() => runAI(`Explain the PDPM coding opportunity to upgrade from ${r.rug} to ${r.suggestedRug} for ${r.name}. What documentation is needed?`)}
                      className="text-[10px] bg-white border border-green-200 text-green-700 rounded px-1.5 py-0.5 hover:bg-green-50">✨ Explain</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* QM Watch + Section Gaps */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-data-blue" /> QM Watch
            </h3>
            <div className="space-y-2">
              {qmWatch.map(qm => (
                <div key={qm.measure} className="flex items-center gap-3 text-sm">
                  {qm.status === 'ok'
                    ? <CheckCircle className="h-3.5 w-3.5 text-risk-low flex-shrink-0" />
                    : <AlertTriangle className="h-3.5 w-3.5 text-risk-medium flex-shrink-0" />}
                  <span className="flex-1 text-xs">{qm.measure}</span>
                  <span className={`font-mono text-xs font-bold ${qm.status === 'warn' ? 'text-risk-high' : 'text-risk-low'}`}>{qm.value}%</span>
                  <span className="text-[10px] text-text-muted">Nat: {qm.threshold}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-risk-medium" /> MDS Section Gaps
            </h3>
            <div className="space-y-2">
              {sectionGaps.map(g => (
                <div key={g.section} className="p-2.5 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <div className="font-medium text-xs text-risk-medium">{g.section}</div>
                  <div className="text-xs text-text-muted mt-0.5">{g.issue}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Residents: {g.residents.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
