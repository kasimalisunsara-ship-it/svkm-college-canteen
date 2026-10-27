import React from 'react';
import { ClipboardCheck, Flame, Bell, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    key: 'Placed',
    label: 'Order Placed',
    description: 'Received by kitchen',
    icon: ClipboardCheck,
  },
  {
    key: 'Preparing',
    label: 'Preparing',
    description: 'Food is being cooked',
    icon: Flame,
  },
  {
    key: 'Ready',
    label: 'Ready for Pickup',
    description: 'Hot & fresh at counter',
    icon: Bell,
  },
  {
    key: 'Completed',
    label: 'Completed',
    description: 'Enjoy your meal!',
    icon: CheckCircle2,
  }
];

export const OrderProgressTracker = ({ status }) => {
  const getStepIndex = (st) => {
    switch (st) {
      case 'Placed': return 0;
      case 'Preparing': return 1;
      case 'Ready': return 2;
      case 'Completed': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Live Status Tracker</h3>
          <p className="text-xs text-slate-500">Real-time status updates from cafeteria kitchen</p>
        </div>
        <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
          status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
          status === 'Ready' ? 'bg-amber-100 text-amber-800 animate-pulse' :
          status === 'Preparing' ? 'bg-orange-100 text-orange-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          Status: {status}
        </span>
      </div>

      {/* Visual Timeline Bar */}
      <div className="relative py-4">
        {/* Progress Connecting Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full z-0">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-700"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps Grid */}
        <div className="relative z-10 grid grid-cols-4 gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center text-center group">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-md ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-orange-600 text-white shadow-orange-600/30 scale-110 ring-4 ring-orange-100'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isCurrent ? 'animate-bounce' : ''}`} />
                </div>

                <div className="mt-3">
                  <span className={`block text-xs font-extrabold ${
                    isCurrent ? 'text-orange-600' : isDone ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-400 font-medium mt-0.5">
                    {step.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
