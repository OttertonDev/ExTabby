import { type ReactNode } from 'react';
import { FilledButton, OutlinedButton, TextButton, ElevatedButton } from '@/lib/material-web-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}

function Button({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}: ButtonProps) {
  // Map size to Material Web styling
  const sizeClasses = {
    default: 'h-10 px-6 text-sm',
    xs: 'h-7 px-3 text-xs',
    sm: 'h-8 px-4 text-sm',
    lg: 'h-11 px-7 text-base',
    icon: 'size-10',
    'icon-xs': 'size-7',
    'icon-sm': 'size-8',
    'icon-lg': 'size-11',
  };

  const baseClasses = cn(
    'font-bold rounded-full transition-all',
    sizeClasses[size],
    className
  );

  // Map variants to Material Web button types
  switch (variant) {
    case 'outline':
      return (
        <OutlinedButton className={baseClasses} {...props}>
          {children}
        </OutlinedButton>
      );

    case 'ghost':
    case 'link':
      return (
        <TextButton className={baseClasses} {...props}>
          {children}
        </TextButton>
      );

    case 'secondary':
      return (
        <ElevatedButton className={baseClasses} {...props}>
          {children}
        </ElevatedButton>
      );

    case 'destructive':
      return (
        <FilledButton
          className={cn(baseClasses, 'bg-destructive text-destructive-foreground')}
          {...props}
        >
          {children}
        </FilledButton>
      );

    case 'default':
    default:
      return (
        <FilledButton className={baseClasses} {...props}>
          {children}
        </FilledButton>
      );
  }
}

export { Button };

