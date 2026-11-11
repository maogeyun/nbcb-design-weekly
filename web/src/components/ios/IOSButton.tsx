import Link from 'next/link';

type IOSButtonVariant = 'borderless' | 'borderedProminent' | 'tinted' | 'glass';

interface IOSButtonProps {
  variant?: IOSButtonVariant;
  block?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  children: React.ReactNode;
  className?: string;
}

const variantClass: Record<IOSButtonVariant, string> = {
  borderless: 'ios-button--borderless',
  borderedProminent: 'ios-button--bordered-prominent',
  tinted: 'ios-button--tinted',
  glass: 'ios-button--glass',
};

export function IOSButton({
  variant = 'borderless',
  block = false,
  disabled = false,
  href,
  onClick,
  type = 'button',
  children,
  className = '',
}: IOSButtonProps) {
  const cls = [
    'ios-button',
    variantClass[variant],
    block ? 'ios-button--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
