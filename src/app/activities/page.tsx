'use client';
import { useState } from 'react';
import { Smile, Calendar, Users, AlertTriangle, CheckCircle, Clock, Sparkles, Star } from 'lucide-react';

const calendar = [
  { time: '9:00 AM', activity: 'Morning Stretch & Exercise', location: 'Dining Room', attendance: 14, capacity: 20 },
  { time: '10:30 AM', activity: 'Bingo', location: 'Activity Room', attendance: 22, capacity: 25 },
  { time: '1:00 PM', activity: 'Music Therapy', location: 'Sunroom', attendance: 8, capacity: 15 },
  { time: '2:30 PM', activity: 'Arts & Crafts', location: 'Activity Room', attendance: 11, capacity: 15 },
  { time: '4:00 PM', activity: 'Current Events Discussion', location: 'Lounge', attendance: 6, capacity: 12 },
];

const atRiskResidents = [
  { id: 'P12', name: 'Eleanor B.', room: '204A', issue: 'No activity participation in 14 days', dxRisk: 'Depression screen overdue', severity: 'high' },
  { id: 'P31', name: 'Harold V.', room: '112B', issue: 'Declined all group activities — prefers 1:1', dxRisk: 'Social isolation noted in care plan', severity: 'medium' },
  { id: 'P55', name: 'Irene S.', room: '307C', issue: 'Family reports decreased engagement', dxRisk: 'Cognitive decline concern', severity: 'medium' },
];

const complianceItems = [
  { label: 'Activity assessments current (within 30 days)', status: true },
  { label: 'Individualized activity care plans documented', status: true },
  { label: 'Monthly calendar posted and distributed', status: true },
  { label: 'Volunteer log up to date', status: false },
  { label: 'Resident council minutes documented', status: true },
  { label: 'MDS Section F data submitted', status: false },
];

export default function ActivitiesPage() {
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
        body: JSON.stringify({ department: 'activities', task: prompt }),
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
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Activities Department</h2>
          <p className="text-sm text-text-muted mt-1">Programming, participation tracking, compliance, and resident engagement</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">1 High Risk Resident</span>
          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">2 Compliance Gaps</span>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="card border-l-4 border-l-green-400">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-green-500" /> AI Activities Assistant
        </h3>
        <div className="flex gap-2 flex-wrap mb-3">
          {['Generate next month activity calendar', 'Write care plan for Eleanor B. isolation risk', 'Draft resident council meeting agenda', 'Create 1:1 engagement plan for Harold V.'].map(q => (
            <button key={q} onClick={() => runAI(q)}
              className="text-xs bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1 hover:bg-green-100 transition-colors">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={aiTask} onChange={e => setAiTask(e.target.value)}
            placeholder="Generate a calendar, draft a care plan, write a note…"
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-green-400"
            onKeyDown={e => e.key === 'Enter' && runAI(aiTask)} />
          <button onClick={() => runAI(aiTask)} disabled={!aiTask || aiLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
            {aiLoading ? '…' : 'Ask'}
          </button>
        </div>
        {aiResult && (
          <div className="mt-3 p-3 bg-green-50 rounded-md text-sm text-text-primary whitespace-pre-wrap border border-green-100">{aiResult}</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Today's Calendar */}
        <div className="card col-span-2">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-data-blue" /> Today's Programming
          </h3>
          <div className="space-y-2">
            {calendar.map(c => {
              const pct = Math.round((c.attendance / c.capacity) * 100);
              return (
                <div key={c.time} className="flex items-center gap-4 py-2 border-b border-border/50 last:border-0">
                  <span className="text-xs font-mono text-text-muted w-20 flex-shrink-0">{c.time}</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-text-primary">{c.activity}</span>
                    <span className="text-xs text-text-muted ml-2">{c.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono text-text-muted w-14">{c.attendance}/{c.capacity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compliance */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-risk-low" /> Compliance Checklist
          </h3>
          <div className="space-y-2">
            {complianceItems.map(item => (
              <div key={item.label} className="flex items-start gap-2 text-xs">
                {item.status
                  ? <CheckCircle className="h-3.5 w-3.5 text-risk-low flex-shrink-0 mt-0.5" />
                  : <AlertTriangle className="h-3.5 w-3.5 text-risk-high flex-shrink-0 mt-0.5" />}
                <span className={item.status ? 'text-text-muted' : 'text-risk-high font-medium'}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* At-Risk Residents */}
      <div className="card">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-risk-medium" /> Engagement Risk — Residents Needing Attention
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {atRiskResidents.map(r => (
            <div key={r.id} className={`p-3 rounded-lg border ${r.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <div className="font-medium text-sm mb-1">{r.name} — Room {r.room}</div>
              <div className="text-xs text-text-muted mb-1">{r.issue}</div>
              <div className="text-xs text-risk-high font-medium">{r.dxRisk}</div>
              <button onClick={() => runAI(`Create a 1:1 engagement plan for ${r.name} who has: ${r.issue}. Diagnosis risk: ${r.dxRisk}`)}
                className="mt-2 text-xs bg-white border border-border rounded px-2 py-1 hover:bg-gray-50 transition-colors">
                ✨ Generate Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
