import Link from 'next/link';
import { Activity, LayoutDashboard, Settings, Users } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-navy text-white flex flex-col h-full">
      <div className="p-4 flex items-center gap-2 border-b border-white/10">
        <Activity className="h-6 w-6" />
        <span className="font-semibold text-lg tracking-tight">APEX CLINICAL</span>
      </div>
      
      <div className="p-4 border-b border-white/10">
        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Facility</label>
        <select className="w-full bg-white/10 border border-white/20 rounded-md text-sm p-2 text-white outline-none">
          <option value="Autumn Lake Towson">Autumn Lake Towson</option>
          <option value="Complete Care Loch Raven">Complete Care Loch Raven</option>
          <option value="Communicare Ellicott City">Communicare Ellicott City</option>
        </select>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-sm font-medium">
          <Activity className="h-4 w-4" /> Physician View
        </Link>
        <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-sm font-medium">
          <LayoutDashboard className="h-4 w-4" /> Administrator
        </Link>
        <Link href="/ops" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-sm font-medium">
          <Users className="h-4 w-4" /> Operations
        </Link>
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-sm font-medium">
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </div>
    </aside>
  );
}
