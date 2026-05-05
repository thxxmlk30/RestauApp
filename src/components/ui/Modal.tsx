import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  layout?: 'center' | 'drawer';
  maxWidthClassName?: string;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  layout = 'center',
  maxWidthClassName = 'max-w-md',
}: ModalProps) {
  if (!open) return null;

  if (layout === 'drawer') {
    return (
      <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" onClick={onClose}>
        <div
          className={`ml-auto flex h-full w-full flex-col bg-white shadow-2xl ${maxWidthClassName}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
            <button type="button" className="text-gray-500 transition hover:text-gray-700" onClick={onClose} aria-label="Fermer">
              x
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className={`w-full rounded-2xl bg-white p-6 shadow-2xl ${maxWidthClassName}`} onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
          <button type="button" className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Fermer">
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
