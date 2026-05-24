'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, LayoutDashboard, Users, Settings, Heart,
  ClipboardList, DollarSign, Utensils, Smile, Brain,
  Sparkles, ChevronDown, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navSections = [
  {
    label: 'Leadership',
    items: [
      { href: '/',             icon: Activity,       label: 'Physician View' },
      { href: '/admin',        icon: LayoutDashboard, label: 'Administrator' },
      { href: '/ops',          icon: Users,           label: 'Operations' },
    ]
  },
  {
    label: 'Clinical',
    items: [
      { href: '/nursing',      icon: Heart,           label: 'Nursing / DON' },
      { href: '/mds',          icon: ClipboardList,   label: 'MDS Coordinator' },
      { href: '/dietary',      icon: Utensils,        label: 'Dietitian' },
    ]
  },
  {
    label: 'Support Services',
    items: [
      { href: '/social-work',      icon: Users,       label: 'Social Work' },
      { href: '/activities',       icon: Smile,       label: 'Activities' },
      { href: '/business-office',  icon: DollarSign,  label: 'Business Office' },
    ]
  },
  {
    label: 'AI Command',
    items: [
      { href: '/ai-command',   icon: Sparkles,        label: 'AI Command Center' },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="w-64 bg-navy text-white flex flex-col h-full overflow-y-auto">
      <div className="p-4 flex items-center gap-2 border-b border-white/10">
        <Activity className="h-6 w-6 text-blue-300" />
        <span className="font-semibold text-lg tracking-tight">APEX CLINICAL</span>
      </div>

      <div className="p-4 border-b border-white/10">
        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Facility</label>
        <select className="w-full bg-white/10 border border-white/20 rounded-md text-sm p-2 text-white outline-none">
          <option value="Apex Health SNF">Apex Health SNF</option>
          <option value="Autumn Lake Towson">Autumn Lake Towson</option>
          <option value="Complete Care Loch Raven">Complete Care Loch Raven</option>
          <option value="Communicare Ellicott City">Communicare Ellicott City</option>
        </select>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navSections.map(section => (
          <div key={section.label} className="mb-1">
            <button
              onClick={() => toggle(section.label)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
            >
              <span>{section.label}</span>
              {collapsed[section.label]
                ? <ChevronRight className="h-3 w-3" />
                : <ChevronDown className="h-3 w-3" />}
            </button>
            {!collapsed[section.label] && (
              <div className="space-y-0.5">
                {section.items.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'hover:bg-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-sm font-medium text-white/70 hover:text-white">
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </div>
    </aside>
  );
}
