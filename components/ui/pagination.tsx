'use client';

import * as React from 'react';
import Link, { type LinkProps } from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      'flex flex-row items-center gap-1 text-sm font-medium',
      className
    )}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('list-none', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
  isDisabled?: boolean;
} & Pick<LinkProps, 'href' | 'prefetch' | 'replace' | 'scroll'> &
  React.ComponentPropsWithoutRef<'a'>;

const PaginationLink = ({
  className,
  isActive,
  isDisabled,
  href,
  ...props
}: PaginationLinkProps) => (
  <Link
    aria-current={isActive ? 'page' : undefined}
    aria-disabled={isDisabled}
    tabIndex={isDisabled ? -1 : undefined}
    className={cn(
      'flex h-10 w-10 items-center justify-center rounded-md border-input px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
      isActive && 'bg-white text-black',
      isDisabled && 'bg-transparent pointer-events-none opacity-50',
      className
    )}
    href={href}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  ...props
}: Omit<PaginationLinkProps, 'children'>) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn('p-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  ...props
}: Omit<PaginationLinkProps, 'children'>) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn('p-2.5', className)}
    {...props}
  >
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn(
      'flex h-10 w-10 items-center justify-center rounded-md border border-transparent bg-transparent',
      className
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
