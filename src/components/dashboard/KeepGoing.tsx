import { Calendar, BarChart3, Heart } from 'lucide-react';

export function KeepGoing() {
  const tips = [
    {
      id: 'tip-1',
      icon: Calendar,
      text: 'Consistency builds skills.',
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'tip-2',
      icon: BarChart3,
      text: 'Small progress is big progress.',
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'tip-3',
      icon: Heart,
      text: 'You can do it! Keep learning.',
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div
      id="dashboard-keep-going"
      className="space-y-3.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm sm:text-base font-bold text-white">Keep Going</h2>
        </div>
      </div>

      <div className="space-y-2.5">
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.id}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-800/80 bg-[#141210] hover:border-neutral-700/80 transition-all"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${tip.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm text-neutral-300 font-medium">
                {tip.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
