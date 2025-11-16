import React, { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader(props: Readonly<SectionHeaderProps>) {
  const { title, description, icon, actions, className } = props;
  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${className || ""}`}>
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-300">
            {icon}
          </div>
        ) : null}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export default SectionHeader;
