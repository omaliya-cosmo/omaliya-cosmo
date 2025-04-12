import * as React from "react";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  children?: React.ReactNode;
  className?: string;
}

export interface BreadcrumbItemProps extends React.ComponentProps<"li"> {
  children?: React.ReactNode;
  className?: string;
}

export interface BreadcrumbLinkProps {
  children?: React.ReactNode;
  className?: string;
  href?: string;
  isActive?: boolean;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex items-center text-sm", className)}
        {...props}
      />
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("flex items-center", className)}
        {...props}
      />
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = ({
  children,
  className,
  href,
  isActive,
}: BreadcrumbLinkProps) => {
  if (!href || isActive) {
    return (
      <span
        className={cn(
          "text-gray-600 flex items-center",
          isActive && "font-medium text-gray-900",
          className
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {children}
        {!isActive && (
          <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-400" />
        )}
      </span>
    );
  }

  return (
    <>
      <Link
        href={href}
        className={cn(
          "text-gray-500 hover:text-gray-900 transition-colors flex items-center",
          className
        )}
      >
        {children}
      </Link>
      <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-400" />
    </>
  );
};
BreadcrumbLink.displayName = "BreadcrumbLink";

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink };
