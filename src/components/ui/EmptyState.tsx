import React, { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState(props: Readonly<EmptyStateProps>) {
  const { title, description, icon, action, className } = props;
  return (
    <div className={`text-center rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-neutral-900 ${className || ""}`}>
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
          {icon}
        </div>
      ) : null}
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description ? (
        <p className="mx-auto mb-4 max-w-md text-sm text-gray-600 dark:text-gray-400">{description}</p>
      ) : null}
      {action ? <div className="mt-2 flex items-center justify-center">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
