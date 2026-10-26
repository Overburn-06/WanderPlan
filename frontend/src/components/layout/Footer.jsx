import React from 'react';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center text-white">
            <Compass className="w-3 h-3" />
          </div>
          <span className="font-semibold text-slate-800">WanderPlan</span>
          <span className="text-slate-300">•</span>
          <span>Collaborative Trip Planner</span>
        </div>
      </div>
    </footer>
  );
}
