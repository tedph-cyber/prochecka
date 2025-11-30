'use client';
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/hooks/use-scroll';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import ProfileDropdown from '@/components/ProfileDropdown';

interface HeaderProps {
  user?: any;
  isGuest?: boolean;
  actionPlan?: any;
  messagesLength?: number;
  onSignOut: () => void;
  onResetChat?: () => void;
  onViewPlan?: () => void;
}

export function Header({
  user,
  isGuest = false,
  actionPlan,
  messagesLength = 0,
  onSignOut,
  onResetChat,
  onViewPlan,
}: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-b border-transparent', {
        'bg-background/95 supports-backdrop-filter:bg-background/50 border-border backdrop-blur-lg':
          scrolled,
      })}
    >
      <nav className="mx-auto flex h-14 items-center justify-between px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2 hover:bg-accent rounded-md p-2 transition-colors">
          <div className="rounded-md p-1">
            <Image src="/images/logo.png" alt="Prochecka Logo" width={28} height={28} className="sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Prochecka</h1>
        </div>

        <div className="hidden items-center gap-1.5 sm:gap-2 md:flex">
          {isGuest && (
            <p className="text-xs sm:text-sm text-muted-foreground mr-2 hidden lg:flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span>Guest Mode</span>
            </p>
          )}
          {!isGuest && user && (
            <p className="text-xs text-muted-foreground mr-2 hidden xl:flex items-center">
              User ID: <span className="font-mono ml-1">{user.id}</span>
            </p>
          )}
          {actionPlan && (
            <Button
              onClick={onViewPlan}
              variant="outline"
              size="sm"
              className="bg-green-600 text-white hover:bg-green-700 border-green-600"
            >
              <span className="hidden sm:inline">View Plan</span>
              <span className="sm:hidden">Plan</span>
            </Button>
          )}
          {messagesLength > 0 && (
            <Button onClick={onResetChat} variant="outline" size="sm">
              <span className="hidden sm:inline">New Assessment</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}
          {isGuest ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/sign-in">Sign In</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/auth/sign-up">Sign Up</a>
              </Button>
            </>
          ) : (
            <ProfileDropdown user={user} onSignOut={onSignOut} />
          )}
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      <MobileMenu open={open} className="flex flex-col justify-between gap-2">
        <div className="grid gap-y-2">
          {isGuest && (
            <div className="px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span>Guest Mode - Sign up to save your results</span>
            </div>
          )}
          {actionPlan && onViewPlan && (
            <button
              onClick={() => {
                onViewPlan();
                setOpen(false);
              }}
              className={buttonVariants({
                variant: 'ghost',
                className: 'justify-start bg-green-600 text-white hover:bg-green-700',
              })}
            >
              View Plan
            </button>
          )}
          {messagesLength > 0 && onResetChat && (
            <button
              onClick={() => {
                onResetChat();
                setOpen(false);
              }}
              className={buttonVariants({
                variant: 'ghost',
                className: 'justify-start',
              })}
            >
              New Assessment
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {isGuest ? (
            <>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <a href="/auth/sign-in">Sign In</a>
              </Button>
              <Button className="w-full" asChild>
                <a href="/auth/sign-up">Sign Up</a>
              </Button>
            </>
          ) : (
            <div className="px-4">
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm font-medium truncate mr-2">{user?.email}</span>
                <Button onClick={onSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </MobileMenu>
    </header>
  );
}

type MobileMenuProps = React.ComponentProps<'div'> & {
  open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === 'undefined') return null;

  return createPortal(
    <div
      id="mobile-menu"
      className={cn(
        'bg-background/95 supports-backdrop-filter:bg-background/50 backdrop-blur-lg',
        'fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y md:hidden',
      )}
    >
      <div
        data-slot={open ? 'open' : 'closed'}
        className={cn(
          'data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out',
          'size-full p-4',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
