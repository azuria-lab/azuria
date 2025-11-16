import React, { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard(props: Readonly<StatCardProps>) {
  const { label, value, hint, icon, className } = props;
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-neutral-900 ${className || ""}`}>
      {icon ? (
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-300">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <div className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</div>
        {hint ? <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p> : null}
      </div>
    </div>
  );
}

export default StatCard;
