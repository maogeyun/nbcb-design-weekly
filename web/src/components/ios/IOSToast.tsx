'use client';

import { useState } from 'react';

interface IOSToastProps {
  message: string | null;
}

export function IOSToast({ message }: IOSToastProps) {
  if (!message) return null;
  return (
    <div className="ios-toast" role="status">
      {message}
    </div>
  );
}

export function useIosToast() {
  const [message, setMessage] = useState<string | null>(null);

  const show = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  return { message, show };
}
