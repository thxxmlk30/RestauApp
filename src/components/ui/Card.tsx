import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <section className={`bg-white rounded-2xl border border-gray-100 ${className}`}>
      {title && <div className="px-5 py-4 border-b border-gray-100 font-semibold text-secondary-900">{title}</div>}
      <div className="p-5">{children}</div>
    </section>
  );
}
