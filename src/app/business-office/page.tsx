'use client';
import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock, Sparkles, FileText, CheckCircle } from 'lucide-react';

const arSummary = {
  total: 1_847_320,
  current: 612_400,
  over30: 384_100,
  over60: 291_800,
  over90: 559_020,
};

const denials = [
  { id: 'D1', payer: 'Medicare Advantage — Aetna', resident: 'Patient 7', amount: 14_280, reason: 'Missing physician certification', daysOld: 12, action: 'Pending appeal' },
  { id: 'D2', payer: 'Medicaid Maryland', resident: 'Patient 22', amount: 8_640, reason: 'Authorization expired', daysOld: 5, action: 'Re-auth submitted' },
  { id: 'D3', payer: 'UnitedHealthcare MA', resident: 'Patient 41', amount: 21_180, reason: 'Level of care not supported', daysOld: 18, action: 'Appeal — awaiting review' },
  { id: 'D4', payer: 'Medicare FFS', resident: 'Patient 9', amount: 6_300, reason: 'ADL documentation insufficient', daysOld: 3, action: 'MDS correction in progress' },
];

const censusRevenue = [
  { payer: 'Medicare A', census: 22, rateRange: '$560–$780/day', monthly: 398_440 },
  { payer: 'Medicare Advantage', census: 31, rateRange: '$480–$640/day', monthly: 484_800 },
  { payer: 'Medicaid', census: 27, rateRange: '$240–$310/day', monthly: 231_930 },
  { payer: 'Private Pay', census: 8, rateRange: '$320–$420/day', monthly: 89_600 },
];

const privatePayAlerts = [
  { name: 'Dorothy M.', room: '301C', balance: 4_200, daysOverdue: 22, note: 'Son unresponsive to calls' },
  { name: 'Frank S.', room: '115A', balance: 1_800, daysOverdue: 8, note: 'Payment plan proposed' },
];

const fmt = (n: number) => '$' + n.toLocaleString();

export default function BusinessOfficePage() {
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
        body: JSON.stringify({ department: 'business_office', task: prompt }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error);
    } catch {
      setAiResult('AI service unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const over90Pct = Math.round((arSummary.over90 / arSummary.total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Business Office</h2>
          <p className="text-sm text-text-muted mt-1">Accounts receivable, denials, billing opportunities, payer intelligence</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">{over90Pct}% AR 90+</span>
          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">{denials.length} Active Denials</span>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="card border-l-4 border-l-blue-400">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" /> AI Billing Intelligence
        </h3>
        <div className="flex gap-2 flex-wrap mb-3">
          {['Identify top billing recovery opportunities', 'Draft appeal letter for Aetna denial D1', 'Summarize 90+ day AR risk', 'Find Medicare documentation gaps'].map(q => (
            <button key={q} onClick={() => runAI(q)}
              className="text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1 hover:bg-blue-100 transition-colors">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={aiTask} onChange={e => setAiTask(e.target.value)}
            placeholder="Draft an appeal, analyze payer trends, identify billing risk…"
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400"
            onKeyDown={e => e.key === 'Enter' && runAI(aiTask)} />
          <button onClick={() => runAI(aiTask)} disabled={!aiTask || aiLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {aiLoading ? '…' : 'Analyze'}
          </button>
        </div>
        {aiResult && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm text-text-primary whitespace-pre-wrap border border-blue-100">{aiResult}</div>
        )}
      </div>

      {/* AR Summary */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total AR', value: fmt(arSummary.total), color: 'text-text-primary' },
          { label: 'Current (0–30)', value: fmt(arSummary.current), color: 'text-risk-low' },
          { label: '31–60 Days', value: fmt(arSummary.over30), color: 'text-risk-medium' },
          { label: '61–90 Days', value: fmt(arSummary.over60), color: 'text-orange-600' },
          { label: '90+ Days', value: fmt(arSummary.over90), color: 'text-risk-high' },
        ].map(kpi => (
          <div key={kpi.label} className="card text-center py-3">
            <div className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-text-muted mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Denials */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-risk-high" /> Active Denials
          </h3>
          <div className="space-y-3">
            {denials.map(d => (
              <div key={d.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{d.resident}</span>
                  <span className="text-sm font-mono font-bold text-risk-high">{fmt(d.amount)}</span>
                </div>
                <div className="text-xs text-text-muted">{d.payer}</div>
                <div className="text-xs text-risk-high mt-1">{d.reason}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-text-muted">{d.daysOld} days old</span>
                  <button onClick={() => runAI(`Draft an appeal letter for a denial from ${d.payer} for ${d.resident}. Denial reason: ${d.reason}. Amount: ${fmt(d.amount)}`)}
                    className="text-[10px] bg-white border border-red-200 text-red-700 rounded px-2 py-0.5 hover:bg-red-50 transition-colors">
                    ✨ Draft Appeal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by payer + Private pay alerts */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-risk-low" /> Revenue by Payer Mix
            </h3>
            <div className="space-y-2">
              {censusRevenue.map(r => (
                <div key={r.payer} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{r.payer}</span>
                    <span className="text-xs text-text-muted ml-2">{r.census} residents · {r.rateRange}</span>
                  </div>
                  <span className="font-mono text-sm text-risk-low font-semibold">{fmt(r.monthly)}/mo</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border flex justify-between font-semibold text-sm">
                <span>Total Monthly Revenue</span>
                <span className="font-mono">{fmt(censusRevenue.reduce((a, r) => a + r.monthly, 0))}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-risk-medium" /> Private Pay — Overdue Balances
            </h3>
            <div className="space-y-3">
              {privatePayAlerts.map(p => (
                <div key={p.name} className="p-2.5 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <div className="flex justify-between mb-0.5">
                    <span className="font-medium text-sm">{p.name} — Room {p.room}</span>
                    <span className="font-mono text-sm font-bold text-risk-high">{fmt(p.balance)}</span>
                  </div>
                  <div className="text-xs text-text-muted">{p.daysOverdue} days overdue · {p.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
