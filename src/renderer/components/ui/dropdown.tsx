import * as React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

// ==================== Dropdown Context ====================

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
}

// ==================== Dropdown Root ====================

export interface DropdownProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ children, open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setIsOpen = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, close]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, close }}>
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

// ==================== Dropdown Trigger ====================

export interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showChevron?: boolean;
}

const DropdownTrigger = React.forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ className, children, showChevron = true, ...props }, ref) => {
    const { isOpen, setIsOpen } = useDropdownContext();

    return (
      <button
        ref={ref}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs',
          'transition-colors duration-150',
          'text-muted-foreground hover:bg-accent',
          className
        )}
        {...props}
      >
        {children}
        {showChevron && (
          <ChevronDown
            className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')}
          />
        )}
      </button>
    );
  }
);

DropdownTrigger.displayName = 'DropdownTrigger';

// ==================== Dropdown Content ====================

export interface DropdownContentProps {
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
  align?: 'start' | 'end';
  width?: string;
}

const DropdownContent: React.FC<DropdownContentProps> = ({
  children,
  className,
  position = 'top',
  align = 'start',
  width = 'w-48',
}) => {
  const { isOpen } = useDropdownContext();

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute z-50 bg-popover rounded-lg shadow-lg',
        'border border-border py-1',
        position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
        align === 'start' ? 'left-0' : 'right-0',
        width,
        className
      )}
    >
      {children}
    </div>
  );
};

// ==================== Dropdown Header ====================

export interface DropdownHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const DropdownHeader: React.FC<DropdownHeaderProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'px-3 py-2 text-xs text-muted-foreground',
        'border-b border-border',
        className
      )}
    >
      {children}
    </div>
  );
};

// ==================== Dropdown Item ====================

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, children, selected, icon, description, onClick, ...props }, ref) => {
    const { close } = useDropdownContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      close();
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-left text-sm',
          'hover:bg-accent',
          selected && 'bg-accent',
          className
        )}
        {...props}
      >
        {icon && (
          <div
            className={cn(
              'flex-shrink-0',
              selected ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'font-medium truncate',
              selected
                ? 'text-primary'
                : 'text-foreground'
            )}
          >
            {children}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground truncate">
              {description}
            </div>
          )}
        </div>
      </button>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

// ==================== Dropdown Separator ====================

const DropdownSeparator: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn('border-t border-border my-1', className)}
    />
  );
};

// ==================== Exports ====================

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownHeader,
  DropdownItem,
  DropdownSeparator,
};
