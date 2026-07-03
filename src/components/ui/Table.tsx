import * as React from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────── Table wrapper ─────────────────────────── */

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto rounded-xl border border-navy-700/60">
    <table
      ref={ref}
      className={cn('gfs-table w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

/* ─────────────────────────── TableHeader ─────────────────────────── */

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('[&_tr]:border-b [&_tr]:border-navy-700/60', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

/* ─────────────────────────── TableBody ─────────────────────────── */

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

/* ─────────────────────────── TableFooter ─────────────────────────── */

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-navy-700/60 bg-navy-900/40 font-medium',
      className
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

/* ─────────────────────────── TableRow ─────────────────────────── */

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-navy-700/40 transition-colors',
      'hover:bg-navy-700/30 data-[state=selected]:bg-navy-700/50',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

/* ─────────────────────────── TableHead ─────────────────────────── */

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider',
      'text-gray-400 bg-navy-900/60',
      '[&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

/* ─────────────────────────── TableCell ─────────────────────────── */

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-4 py-3.5 align-middle text-sm text-gray-200',
      '[&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

/* ─────────────────────────── TableCaption ─────────────────────────── */

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-gray-500', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
