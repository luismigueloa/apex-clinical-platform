import { Users } from 'lucide-react';

export default function OpsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Operations View</h2>
        <p className="text-sm text-text-muted mt-1">Discharge planning, readmission risk, and compliance</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-data-blue" /> Discharge Planning Queue
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-sm text-text-muted">
                <th className="pb-2 font-medium">Resident</th>
                <th className="pb-2 font-medium">Days Left (Med A)</th>
                <th className="pb-2 font-medium">Destination</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-border/50">
                <td className="py-3 font-medium">Patient 4</td>
                <td className="py-3 text-risk-high font-mono">2 Days</td>
                <td className="py-3">Home with HH</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 font-medium">Patient 19</td>
                <td className="py-3 text-risk-medium font-mono">5 Days</td>
                <td className="py-3">Long Term Care</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 font-medium">Patient 8</td>
                <td className="py-3 font-mono text-text-muted">12 Days</td>
                <td className="py-3">Home</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Physician Compliance</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium block">Dr. Smith</span>
                <span className="text-xs text-text-muted">Attending</span>
              </div>
              <div className="text-right">
                <span className="text-risk-high font-mono block">14 Unsigned Orders</span>
                <span className="text-xs text-text-muted">2 Overdue Visits</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-border/50 pt-4">
              <div>
                <span className="font-medium block">NP Johnson</span>
                <span className="text-xs text-text-muted">Nurse Practitioner</span>
              </div>
              <div className="text-right">
                <span className="text-risk-low font-mono block">0 Unsigned Orders</span>
                <span className="text-xs text-text-muted">100% Visit Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
