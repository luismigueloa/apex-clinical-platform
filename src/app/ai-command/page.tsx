'use client';
import { useState } from 'react';
import { Sparkles, Play, Clock, CheckCircle, AlertTriangle, Brain, Zap, Shield } from 'lucide-react';

type JobStatus = 'idle' | 'running' | 'done' | 'error';
interface Job { id: string; title: string; department: string; prompt: string; status: JobStatus; result?: string; startedAt?: string; completedAt?: string; }

const autonomousJobs = [
  { id: 'J1', title: 'Morning Clinical Brief', department: 'all', prompt: 'Generate a comprehensive morning briefing covering: top 5 clinical risks across all residents, staffing gaps, regulatory items due today, and any overnight incidents. Be concise and action-oriented.', description: 'Full facility morning intelligence brief' },
  { id: 'J2', title: 'PDPM Revenue Scan', department: 'mds', prompt: 'Analyze all current residents and identify PDPM RUG upgrade opportunities. For each opportunity, specify the current RUG, suggested RUG, documentation needed, and estimated daily revenue impact.', description: 'Find all uncaptured PDPM revenue' },
  { id: 'J3', title: 'Deficiency Prevention Report', department: 'compliance', prompt: 'Review current QM data, staffing levels, incident reports, and open care plan gaps. Identify the top 5 items most likely to result in a survey deficiency and recommend immediate corrective actions.', description: 'Survey deficiency risk analysis' },
  { id: 'J4', title: 'AR Recovery Analysis', department: 'business_office', prompt: 'Analyze accounts receivable aging. Identify the highest-value denied or stalled claims, prioritize by dollar amount and collectability, and recommend specific recovery actions for each.', description: 'Revenue recovery opportunity scan' },
  { id: 'J5', title: 'Discharge Planning Summary', department: 'social_work', prompt: 'Review all residents approaching Medicare A exhaustion in the next 14 days. For each, summarize discharge barriers, family contact status, and recommended next steps.', description: 'Next 14 days discharge pipeline' },
  { id: 'J6', title: 'Nutrition Risk Sweep', department: 'dietary', prompt: 'Identify all residents with weight loss >5% in 30 days, albumin <3.0, or meal refusal patterns. For each, suggest immediate dietary interventions and physician notification triggers.', description: 'High-risk nutrition identification' },
];

const modelInfo = [
  { model: 'Claude Haiku', use: 'Fast lookups, quick summaries, simple drafts', color: 'bg-green-100 text-green-700' },
  { model: 'Claude Sonnet', use: 'Clinical analysis, care plans, complex reasoning', color: 'bg-blue-100 text-blue-700' },
  { model: 'Claude Opus', use: 'Legal/regulatory deep analysis, multi-step workflows', color: 'bg-purple-100 text-purple-700' },
];

export default function AICommandCenter() {
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [customPrompt, setCustomPrompt] = useState('');
  const [customDept, setCustomDept] = useState('all');
  const [customRunning, setCustomRunning] = useState(false);
  const [customResult, setCustomResult] = useState('');

  const runJob = async (job: typeof autonomousJobs[0]) => {
    setJobs(prev => ({ ...prev, [job.id]: { ...job, status: 'running', startedAt: new Date().toLocaleTimeString() } }));
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: job.department, task: job.prompt, model: 'sonnet' }),
      });
      const data = await res.json();
      setJobs(prev => ({ ...prev, [job.id]: { ...prev[job.id], status: 'done', result: data.result || data.error, completedAt: new Date().toLocaleTimeString() } }));
    } catch {
      setJobs(prev => ({ ...prev, [job.id]: { ...prev[job.id], status: 'error', result: 'Failed — check API connection' } }));
    }
  };

  const runCustom = async () => {
    setCustomRunning(true);
    setCustomResult('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: customDept, task: customPrompt, model: 'sonnet' }),
      });
      const data = await res.json();
      setCustomResult(data.result || data.error);
    } catch {
      setCustomResult('Failed — check API connection');
    } finally {
      setCustomRunning(false);
    }
  };

  const runAll = () => autonomousJobs.forEach(j => runJob(j));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight">AI Command Center</h2>
          <p className="text-sm text-text-muted mt-1">Autonomous facility intelligence — run analysis jobs, generate reports, prevent deficiencies</p>
        </div>
        <button onClick={runAll}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow">
          <Zap className="h-4 w-4" /> Run Full Facility Sweep
        </button>
      </div>

      {/* Model info */}
      <div className="grid grid-cols-3 gap-3">
        {modelInfo.map(m => (
          <div key={m.model} className="card py-3 flex items-center gap-3">
            <Brain className="h-5 w-5 text-purple-400 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm">{m.model}</div>
              <div className="text-xs text-text-muted">{m.use}</div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${m.color}`}>Active</span>
          </div>
        ))}
      </div>

      {/* Security note */}
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
        <span>AI keys are stored securely on the backend only — never exposed to the browser. All AI calls are logged with department, model, and timestamp for audit compliance.</span>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-2 gap-4">
        {autonomousJobs.map(job => {
          const j = jobs[job.id];
          const status = j?.status || 'idle';
          return (
            <div key={job.id} className={`card transition-all ${status === 'running' ? 'border-blue-300 bg-blue-50/30' : status === 'done' ? 'border-green-200' : status === 'error' ? 'border-red-200' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-sm text-text-primary">{job.title}</div>
                  <div className="text-xs text-text-muted">{job.description}</div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {status === 'running' && <span className="text-xs text-blue-600 font-medium animate-pulse">Running…</span>}
                  {status === 'done' && <CheckCircle className="h-4 w-4 text-risk-low" />}
                  {status === 'error' && <AlertTriangle className="h-4 w-4 text-risk-high" />}
                  <button onClick={() => runJob(job)} disabled={status === 'running'}
                    className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
                    <Play className="h-3 w-3" /> {status === 'done' ? 'Re-run' : 'Run'}
                  </button>
                </div>
              </div>
              {j?.startedAt && (
                <div className="text-[10px] text-text-muted flex gap-3 mb-2">
                  <span><Clock className="h-2.5 w-2.5 inline mr-0.5" />Started: {j.startedAt}</span>
                  {j.completedAt && <span>Completed: {j.completedAt}</span>}
                </div>
              )}
              {j?.result && (
                <div className={`mt-2 p-3 rounded-md text-xs text-text-primary whitespace-pre-wrap max-h-48 overflow-y-auto border ${status === 'error' ? 'bg-red-50 border-red-100' : 'bg-white border-border'}`}>
                  {j.result}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Query */}
      <div className="card border-2 border-dashed border-purple-200">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" /> Custom AI Query
        </h3>
        <div className="flex gap-2 mb-3">
          <select value={customDept} onChange={e => setCustomDept(e.target.value)}
            className="border border-border rounded-md px-3 py-2 text-sm outline-none bg-white">
            <option value="all">All Departments</option>
            <option value="nursing">Nursing</option>
            <option value="mds">MDS</option>
            <option value="social_work">Social Work</option>
            <option value="activities">Activities</option>
            <option value="dietary">Dietary</option>
            <option value="business_office">Business Office</option>
            <option value="compliance">Compliance</option>
          </select>
        </div>
        <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
          placeholder="Ask anything about the facility… generate a report, identify a risk, draft a document, analyze a pattern."
          rows={4}
          className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-purple-400 resize-none mb-3" />
        <button onClick={runCustom} disabled={!customPrompt || customRunning}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors">
          <Sparkles className="h-4 w-4" /> {customRunning ? 'Analyzing…' : 'Run Query'}
        </button>
        {customResult && (
          <div className="mt-3 p-4 bg-purple-50 border border-purple-100 rounded-md text-sm text-text-primary whitespace-pre-wrap">
            {customResult}
          </div>
        )}
      </div>
    </div>
  );
}
