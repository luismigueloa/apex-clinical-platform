import { Bell, User } from 'lucide-react';

export function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold text-text-primary text-lg">Autumn Lake Towson</h1>
        <span className="text-text-muted text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <Bell className="h-5 w-5 text-text-muted hover:text-text-primary transition-colors" />
          <span className="absolute -top-1.5 -right-1.5 bg-risk-high text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
            3
          </span>
        </div>
        
        <div className="flex items-center gap-2 border-l border-border pl-6 cursor-pointer">
          <div className="bg-bg-primary h-8 w-8 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-text-muted" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary leading-none">Dr. Rizqui</span>
            <span className="text-xs text-text-muted mt-1">Medical Director</span>
          </div>
        </div>
      </div>
    </header>
  );
}
