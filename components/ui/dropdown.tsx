import React, { useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  sideOffset?: number;
}

export function Dropdown({
  isOpen,
  onClose,
  trigger,
  children,
  className,
  align = 'left',
  sideOffset = 4,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getAlignmentClasses = () => {
    switch (align) {
      case 'right':
        return 'right-0';
      case 'center':
        return 'left-1/2 -translate-x-1/2';
      default:
        return 'left-0';
    }
  };

  return (
    <div className="relative">
      <div ref={triggerRef}>{trigger}</div>

      {isOpen && (
        <DropdownPortal
          triggerRef={triggerRef}
          dropdownRef={dropdownRef}
          align={align}
          sideOffset={sideOffset}
          className={className}
        >
          {children}
        </DropdownPortal>
      )}
    </div>
  );
}

// Portal을 사용하여 드롭다운을 body에 렌더링
function DropdownPortal({
  triggerRef,
  dropdownRef,
  align,
  sideOffset,
  className,
  children,
}: {
  triggerRef: React.RefObject<HTMLDivElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  align: 'left' | 'right' | 'center';
  sideOffset: number;
  className?: string;
  children: ReactNode;
}) {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    const updatePosition = () => {
      if (triggerRef.current && dropdownRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 16; // 여백

        let left = rect.left;
        let top = rect.bottom + sideOffset;

        // 드롭다운 너비 (실제 렌더링된 너비 또는 예상 너비)
        const dropdownWidth = dropdownRect.width || 320; // 기본값 320px

        // 정렬에 따른 초기 위치 조정
        if (align === 'right') {
          left = rect.right - dropdownWidth;
        } else if (align === 'center') {
          left = rect.left + rect.width / 2 - dropdownWidth / 2;
        }

        // 화면 오른쪽 경계 체크
        if (left + dropdownWidth > viewportWidth - padding) {
          left = viewportWidth - dropdownWidth - padding;
        }

        // 화면 왼쪽 경계 체크
        if (left < padding) {
          left = padding;
        }

        // 화면 아래쪽 경계 체크 (드롭다운을 위로 표시)
        const dropdownHeight = dropdownRect.height || 400; // 기본값 400px
        if (top + dropdownHeight > viewportHeight - padding) {
          top = rect.top - dropdownHeight - sideOffset;
          // 위로도 공간이 부족하면 화면 내에서 최대한 표시
          if (top < padding) {
            top = padding;
          }
        }

        setPosition({ top, left });
      }
    };

    // 초기 위치 설정을 위해 약간의 지연
    const timeoutId = setTimeout(updatePosition, 0);

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [triggerRef, dropdownRef, align, sideOffset]);

  const getAlignmentClasses = () => {
    switch (align) {
      case 'right':
        return '-translate-x-full';
      case 'center':
        return '-translate-x-1/2';
      default:
        return '';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'fixed bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto',
        'animate-in fade-in-0 zoom-in-95',
        // 모바일 반응형 처리
        'w-max min-w-[200px]',
        // 모바일에서 최대 너비와 높이 제한
        'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)]',
        // 작은 화면에서 더 작은 최대 높이
        'sm:max-h-96',
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 99999,
      }}
    >
      {children}
    </div>
  );
}

// 사용 예시를 위한 Hook
export function useDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return { isOpen, open, close, toggle };
}
