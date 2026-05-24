'use client';
import { useState } from 'react';
import { Heart, AlertTriangle, CheckCircle, Clock, Sparkles, Users, Activity, ShieldAlert } from 'lucide-react';

const staffingGrid = [
  { shift: '7am–3pm', rns: { scheduled: 3, actual: 2, needed: 3 }, lpns: { scheduled: 4, actual: 4, needed: 4 }, cnas: { scheduled: 12, actual: 10, needed: 12 } },
  { shift: '3pm–11pm', rns: { scheduled: 2, actual: 2, needed: 2 }, lpns: { scheduled: 3, actual: 3, needed: 3 }, cnas: { scheduled: 10, actual: 9, needed: 10 } },
  { shift: '11pm–7am', rns: { scheduled: 1, actual: 1, needed: 1 }, lpns: { scheduled: 2, actual: 1, needed: 2 }, cnas: { scheduled: 6, actual: 5, needed: 6 } },
];

const clinicalAlerts = [
  { id: 'P06', name: 'Ruth A.', room: '103A', alert: 'BP 88/54 — hypotensive episode x2 today', category: 'Vitals', severity: 'critical', time: '08:42' },
  { id: 'P22', name: 'Sandra M.', room: '107B', alert: 'O2 sat 88% on 2L — respiratory decline', category: 'Respiratory', severity: 'critical', time: '10:15' },
  { id: 'P39', name: 'David M.', room: '119C', alert: 'Fall x2 this shift — no injury', category: 'Safety', severity: 'high', time: '09:30' },
  { id: 'P14', name: 'Bernard K.', room: '215B', alert: 'New skin tear left forearm — wound care needed', category: 'Wound', severity: 'high', time: '11:05' },
  { id: 'P51', name: 'Evelyn T.', room: '206A', alert: 'Refusing all medications x2 days', category: 'Medication', severity: 'medium', time: '07:00' },
];

const incidentLog = [
  { id: 'I1', type: 'Fall', resident: 'David M.', time: 'Today 09:30', injury: 'No injury', reportedBy: 'CNA Lopez', reportFiled: true },
  { id: 'I2', type: 'Elopement Attempt', resident: 'George T.', time: 'Yesterday 14:12', injury: 'No injury', reportedBy: 'RN Carter', reportFiled: true },
  { id: 'I3', type: 'Medication Error', resident: 'Alice B.', time: 'Yesterday 20:00', injury: 'No harm — caught before admin', reportedBy: 'LPN Williams', reportFiled: false },
];

const ppd = { target: 3.8, actual: 3.2, rn: { target: 0.75, actual: 0.58 } };

export default function NursingPage() {
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
        body: JSON.stringify({ department: 'nursing', task: prompt }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error);
    } catch {
      setAiResult('AI service unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Nursing / DON Dashboard</h2>
          <p className="text-sm text-text-muted mt-1">Staffing, clinical alerts, incidents, and nursing compliance</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">2 Critical Alerts</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ppd.actual < ppd.target ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>PPD {ppd.actual} (target {ppd.target})</span>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="card border-l-4 border-l-red-400">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-red-500" /> AI Nursing Intelligence
        </h3>
        <div className="flex gap-2 flex-wrap mb-3">
          {['Generate morning nursing huddle brief', 'Draft incident report for David M. fall', 'What residents need physician notification today?', 'Identify staffing shortage risk for tonight'].map(q => (
            <button key={q} onClick={() => runAI(q)}
              className="text-xs bg-red-50 border border-red-200 text-red-700 rounded-full px-3 py-1 hover:bg-red-100 transition-colors">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={aiTask} onChange={e => setAiTask(e.target.value)}
            placeholder="Generate a huddle brief, draft a note, escalate a clinical concern…"
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-red-400"
            onKeyDown={e => e.key === 'Enter' && runAI(aiTask)} />
          <button onClick={() => runAI(aiTask)} disabled={!aiTask || aiLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
            {aiLoading ? '…' : 'Ask'}
          </button>
        </div>
        {aiResult && (
          <div className="mt-3 p-3 bg-red-50 rounded-md text-sm text-text-primary whitespace-pre-wrap border border-red-100">{aiResult}</div>
        )}
      </div>

      {/* Staffing Grid */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <Users className="h-4 w-4 text-data-blue" /> Today's Staffing Grid
          </h3>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>PPD: <span className={`font-bold ${ppd.actual < ppd.target ? 'text-risk-high' : 'text-risk-low'}`}>{ppd.actual}</span> / target {ppd.target}</span>
            <span>RN Hours: <span className={`font-bold ${ppd.rn.actual < ppd.rn.target ? 'text-risk-high' : 'text-risk-low'}`}>{ppd.rn.actual}</span> / target {ppd.rn.target}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="text-left pb-2 font-medium">Shift</th>
                <th className="text-center pb-2 font-medium">RN Sched/Actual</th>
                <th className="text-center pb-2 font-medium">LPN Sched/Actual</th>
                <th className="text-center pb-2 font-medium">CNA Sched/Actual</th>
                <th className="text-center pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {staffingGrid.map(s => {
                const understaffed = s.rns.actual < s.rns.needed || s.lpns.actual < s.lpns.needed || s.cnas.actual < s.cnas.needed;
                return (
                  <tr key={s.shift} className="border-b border-border/50">
                    <td className="py-3 font-medium">{s.shift}</td>
                    {[s.rns, s.lpns, s.cnas].map((r, i) => (
                      <td key={i} className="py-3 text-center">
                        <span className={r.actual < r.needed ? 'text-risk-high font-bold' : 'text-risk-low'}>{r.actual}</span>
                        <span className="text-text-muted">/{r.scheduled}</span>
                      </td>
                    ))}
                    <td className="py-3 text-center">
                      {understaffed
                        ? <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">UNDERSTAFFED</span>
                        : <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Clinical Alerts */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-risk-high" /> Clinical Alerts — Today
          </h3>
          <div className="space-y-2">
            {clinicalAlerts.map(a => (
              <div key={a.id} className={`p-3 rounded-lg border ${a.severity === 'critical' ? 'border-red-300 bg-red-50' : a.severity === 'high' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm">{a.name} — Room {a.room}</span>
                  <span className="text-[10px] font-mono text-text-muted">{a.time}</span>
                </div>
                <div className={`text-xs mt-0.5 font-medium ${a.severity === 'critical' ? 'text-risk-high' : a.severity === 'high' ? 'text-risk-medium' : 'text-data-blue'}`}>{a.alert}</div>
                <button onClick={() => runAI(`Generate an SBAR communication and nursing note for: ${a.name}, ${a.alert}`)}
                  className="mt-1.5 text-[10px] bg-white border border-border rounded px-2 py-0.5 hover:bg-gray-50">✨ Draft SBAR</button>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Log */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-risk-medium" /> Incident Log — Last 48 Hours
          </h3>
          <div className="space-y-3">
            {incidentLog.map(inc => (
              <div key={inc.id} className="p-3 bg-gray-50 border border-border rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{inc.type} — {inc.resident}</span>
                  {!inc.reportFiled && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">REPORT MISSING</span>}
                  {inc.reportFiled && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Filed</span>}
                </div>
                <div className="text-xs text-text-muted">{inc.time} · Reported by {inc.reportedBy}</div>
                <div className="text-xs mt-0.5 text-text-primary">{inc.injury}</div>
                {!inc.reportFiled && (
                  <button onClick={() => runAI(`Draft a complete incident report for a ${inc.type} involving ${inc.resident} at ${inc.time}. ${inc.injury}. Reported by ${inc.reportedBy}`)}
                    className="mt-2 text-[10px] bg-red-50 border border-red-200 text-red-700 rounded px-2 py-0.5 hover:bg-red-100">✨ Draft Report</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
