'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Morning' },
    { href: '/evening', label: 'Evening' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/insights', label: 'Insights' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-semibold text-neutral-900">
            Execution System
          </h1>
          <div className="flex space-x-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
