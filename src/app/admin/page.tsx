import { getQualityMeasures, getCensus, } from '@/lib/pcc-client';
import { ArrowDown, ArrowUp, Activity } from 'lucide-react';

export default async function AdminView() {
  const qualityMeasures = await getQualityMeasures('Autumn Lake Towson');
  const census = await getCensus('Autumn Lake Towson');
  // const incidents = await getIncidents('Autumn Lake Towson');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Administrator Scorecard</h2>
        <p className="text-sm text-text-muted mt-1">Facility performance, compliance, and census</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card flex flex-col justify-between">
          <span className="text-sm text-text-muted font-medium">Five Star Overall</span>
          <div className="text-3xl font-semibold text-text-primary mt-2 flex items-center gap-2">
            ⭐⭐⭐⭐
            <span className="text-sm text-risk-low flex items-center"><ArrowUp className="h-4 w-4" /></span>
          </div>
        </div>
        <div className="card flex flex-col justify-between">
          <span className="text-sm text-text-muted font-medium">Health Inspections</span>
          <div className="text-3xl font-semibold text-text-primary mt-2">⭐⭐⭐⭐⭐</div>
        </div>
        <div className="card flex flex-col justify-between">
          <span className="text-sm text-text-muted font-medium">Staffing</span>
          <div className="text-3xl font-semibold text-text-primary mt-2 flex items-center gap-2">
            ⭐⭐⭐
            <span className="text-sm text-risk-high flex items-center"><ArrowDown className="h-4 w-4" /></span>
          </div>
        </div>
        <div className="card flex flex-col justify-between">
          <span className="text-sm text-text-muted font-medium">Quality Measures</span>
          <div className="text-3xl font-semibold text-text-primary mt-2">⭐⭐⭐⭐</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-data-blue" /> Quality Measures
          </h3>
          <div className="space-y-4">
            {Object.entries(qualityMeasures || {}).map(([key, data]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono text-sm">{data.value}%</span>
                    <span className="text-[10px] text-text-muted block">Nat: {data.national}%</span>
                  </div>
                  {data.trend === 'up' ? <ArrowUp className="h-4 w-4 text-risk-high" /> : <ArrowDown className="h-4 w-4 text-risk-low" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Census & Payer Mix</h3>
          <div className="flex items-end justify-between border-b border-border pb-4 mb-4">
            <div>
              <span className="text-4xl font-semibold text-text-primary">{census?.occupancy}%</span>
              <span className="text-sm text-text-muted block mt-1">Current Occupancy</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Medicare A</span>
              <span className="font-medium">{census?.payerMix.medicareA}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Medicare Advantage</span>
              <span className="font-medium">{census?.payerMix.medicareAdvantage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Medicaid</span>
              <span className="font-medium">{census?.payerMix.medicaid}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Private Pay</span>
              <span className="font-medium">{census?.payerMix.private}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
