import { getResidents } from '@/lib/pcc-client';
import { AlertCircle, AlertTriangle, ArrowUpRight, ChevronDown, FileText, Pill } from 'lucide-react';

export default async function PhysicianView() {
  const residents = await getResidents('Autumn Lake Towson');
  
  const sortedResidents = [...residents].sort((a, b) => b.riskScore - a.riskScore).slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Top 20 Triage List</h2>
          <p className="text-sm text-text-muted mt-1">High-risk patients requiring immediate attention</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-border rounded-md px-3 py-1.5 text-sm bg-white outline-none">
            <option>All Units</option>
            <option>Unit A</option>
            <option>Unit B</option>
            <option>Unit C</option>
          </select>
          <select className="border border-border rounded-md px-3 py-1.5 text-sm bg-white outline-none">
            <option>All Risks</option>
            <option>High Risk (80+)</option>
            <option>Medium Risk (50-79)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedResidents.map((patient) => (
          <div key={patient.id} className="card hover:border-blue-200 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                <div className="flex flex-col items-center justify-center w-16">
                  <span className={`text-2xl font-mono font-bold ${
                    patient.riskScore >= 80 ? 'text-risk-high' : 
                    patient.riskScore >= 50 ? 'text-risk-medium' : 'text-risk-low'
                  }`}>
                    {patient.riskScore}
                  </span>
                  <span className="text-[10px] uppercase text-text-muted font-medium tracking-wider">Risk</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-text-primary text-lg">{patient.name}</h3>
                    <span className="text-sm text-text-muted">Room {patient.room} • {patient.unit}</span>
                  </div>
                  <div className="text-sm font-medium text-text-primary mt-1">
                    {patient.primaryDiagnosis}
                  </div>
                </div>

                <div className="flex gap-2 w-32">
                  {patient.alerts.fallRisk && <div title="Fall Risk" className="h-6 w-6 rounded bg-red-100 flex items-center justify-center"><AlertTriangle className="h-3 w-3 text-risk-high" /></div>}
                  {patient.alerts.medSafety && <div title="Med Safety" className="h-6 w-6 rounded bg-yellow-100 flex items-center justify-center"><Pill className="h-3 w-3 text-risk-medium" /></div>}
                  {patient.alerts.hospitalization && <div title="Hospitalization Risk" className="h-6 w-6 rounded bg-orange-100 flex items-center justify-center"><AlertCircle className="h-3 w-3 text-orange-600" /></div>}
                  {patient.alerts.pdpm && <div title="PDPM Opportunity" className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center"><ArrowUpRight className="h-3 w-3 text-data-blue" /></div>}
                </div>

                <div className="text-sm text-text-muted flex items-center gap-4 w-96">
                  <div>
                    <span className="block text-[10px] uppercase">Vitals</span>
                    <span className="font-mono text-xs">{patient.vitals.bp} • HR {patient.vitals.hr}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase">Last Visit</span>
                    <span className={`font-medium ${patient.daysSinceVisit > 30 ? 'text-risk-high' : ''}`}>
                      {patient.daysSinceVisit} days ago
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 flex gap-2">
                <button className="flex items-center gap-2 text-sm font-medium text-data-blue bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors">
                  <FileText className="h-4 w-4" /> Note
                </button>
                <button className="p-1.5 text-text-muted hover:bg-gray-100 rounded-md">
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Expandable area placeholder - using details tag in React typically requires state, but we'll simulate the open view or just keep it simple for now */}
          </div>
        ))}
      </div>
    </div>
  );
}
