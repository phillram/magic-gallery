import type { JSX, ReactNode } from 'react';

// Every dead end in the app looks the same and does the same job: say what happened,
// then give one way on. A page that only says "not found" leaves the visitor to find
// the back button themselves.
export default function MessagePage({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action: ReactNode;
}): JSX.Element {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h1 className="font-display text-3xl font-bold text-ink-100 sm:text-4xl">{title}</h1>
      <p className="mt-3 text-ink-400">{children}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{action}</div>
    </div>
  );
}
