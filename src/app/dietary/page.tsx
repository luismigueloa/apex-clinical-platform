'use client';
import { useState } from 'react';
import { Utensils, AlertTriangle, CheckCircle, Sparkles, TrendingDown, Scale } from 'lucide-react';

const nutritionAlerts = [
  { id: 'P06', name: 'Ruth A.', room: '103A', issue: 'Weight loss 8.2% in 30 days', bmi: 17.4, albumin: 2.8, risk: 'high', intervention: 'Caloric supplement BID ordered — not initiated' },
  { id: 'P18', name: 'James H.', room: '214B', issue: 'Refusing meals x4 days', bmi: 22.1, albumin: 3.1, risk: 'high', intervention: 'Appetite stimulant requested from MD' },
  { id: 'P36', name: 'Nancy P.', room: '312C', issue: 'Weight loss 4.1% in 30 days', bmi: 20.8, albumin: 3.4, risk: 'medium', intervention: 'Snack program added' },
  { id: 'P47', name: 'Charles W.', room: '108A', issue: 'Low albumin — 2.6', bmi: 21.3, albumin: 2.6, risk: 'medium', intervention: 'Labs pending' },
];

const specialDiets = [
  { diet: 'Mechanical Soft', count: 18, note: 'Speech therapy review needed x3' },
  { diet: 'Pureed', count: 11, note: '' },
  { diet: 'Diabetic (carb control)', count: 23, note: 'Glucose monitoring orders current' },
  { diet: 'Low Sodium (<2g)', count: 14, note: '' },
  { diet: 'Renal Diet', count: 6, note: 'Dietitian review due this week x2' },
  { diet: 'Thickened Liquids', count: 9, note: 'Nectar thick: 6 · Honey thick: 3' },
  { diet: 'NPO / Tube Feeding', count: 3, note: 'Enteral nutrition logs current' },
];

const regulatoryChecklist = [
  { item: 'Monthly weight monitoring for all residents', done: true },
  { item: 'Weight loss >5% in 30 days — physician notification', done: true },
  { item: 'Nutrition assessments within 14 days of admission', done: false },
  { item: 'Care plan updated for all high-risk residents', done: false },
  { item: 'Texture-modified diet orders from physician/SLP', done: true },
  { item: 'Hydration program documented', done: true },
  { item: 'MDS Section K completed for all ARDs', done: false },
];

export default function DietaryPage() {
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
        body: JSON.stringify({ department: 'dietary', task: prompt }),
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
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Dietary / Nutrition</h2>
          <p className="text-sm text-text-muted mt-1">Weight monitoring, nutrition risk, special diets, regulatory compliance</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">2 High Nutrition Risk</span>
          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">3 Compliance Gaps</span>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="card border-l-4 border-l-orange-400">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-500" /> AI Nutrition Assistant
        </h3>
        <div className="flex gap-2 flex-wrap mb-3">
          {['Draft nutrition care plan for Ruth A. weight loss', 'Explain renal diet restrictions for new admit', 'Generate monthly weight trend summary', 'What interventions reduce weight loss risk?'].map(q => (
            <button key={q} onClick={() => runAI(q)}
              className="text-xs bg-orange-50 border border-orange-200 text-orange-700 rounded-full px-3 py-1 hover:bg-orange-100 transition-colors">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={aiTask} onChange={e => setAiTask(e.target.value)}
            placeholder="Draft a nutrition note, care plan, or explain a diet order…"
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-orange-400"
            onKeyDown={e => e.key === 'Enter' && runAI(aiTask)} />
          <button onClick={() => runAI(aiTask)} disabled={!aiTask || aiLoading}
            className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors">
            {aiLoading ? '…' : 'Ask'}
          </button>
        </div>
        {aiResult && (
          <div className="mt-3 p-3 bg-orange-50 rounded-md text-sm text-text-primary whitespace-pre-wrap border border-orange-100">{aiResult}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Nutrition Alerts */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-risk-high" /> Nutrition Risk Alerts
          </h3>
          <div className="space-y-3">
            {nutritionAlerts.map(r => (
              <div key={r.id} className={`p-3 rounded-lg border ${r.risk === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{r.name} — Room {r.room}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${r.risk === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>{r.risk}</span>
                </div>
                <div className="text-xs text-risk-high font-medium mb-1">{r.issue}</div>
                <div className="flex gap-3 text-[10px] text-text-muted mb-1">
                  <span>BMI: {r.bmi}</span>
                  <span>Albumin: {r.albumin} g/dL</span>
                </div>
                <div className="text-xs text-text-muted italic">{r.intervention}</div>
                <button onClick={() => runAI(`Draft a nutrition care plan and physician communication for ${r.name}. Issue: ${r.issue}. BMI ${r.bmi}, Albumin ${r.albumin}. Current intervention: ${r.intervention}`)}
                  className="mt-2 text-[10px] bg-white border border-border rounded px-2 py-0.5 hover:bg-gray-50">✨ Draft Care Plan</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Special Diets */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-data-blue" /> Special Diet Census
            </h3>
            <div className="space-y-1.5">
              {specialDiets.map(d => (
                <div key={d.diet} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0">{d.count}</span>
                  <span className="text-text-primary flex-1">{d.diet}</span>
                  {d.note && <span className="text-[10px] text-risk-medium">{d.note}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Checklist */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-risk-low" /> Regulatory Checklist
            </h3>
            <div className="space-y-2">
              {regulatoryChecklist.map(item => (
                <div key={item.item} className="flex items-start gap-2 text-xs">
                  {item.done
                    ? <CheckCircle className="h-3.5 w-3.5 text-risk-low flex-shrink-0 mt-0.5" />
                    : <AlertTriangle className="h-3.5 w-3.5 text-risk-high flex-shrink-0 mt-0.5" />}
                  <span className={item.done ? 'text-text-muted' : 'text-risk-high font-medium'}>{item.item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
