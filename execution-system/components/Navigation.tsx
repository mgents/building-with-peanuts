'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: '🏠 Home', icon: '🏠', shortLabel: 'Home' },
    { href: '/insights', label: '💡 Insights', icon: '💡', shortLabel: 'Insights' },
    { href: '/reflection', label: '📝 Reflection', icon: '📝', shortLabel: 'Reflect' },
    { href: '/settings', label: '⚙️ Settings', icon: '⚙️', shortLabel: 'Settings' },
  ];

  return (
    <nav className="bg-zinc-800 border-b border-amber-500/30 shadow-2xl shadow-amber-500/10">
      <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <h1 className="text-base sm:text-2xl font-bold text-amber-400 tracking-wider uppercase">
            <span className="hidden sm:inline">⚡ SOVEREIGN</span>
            <span className="sm:hidden">⚡ SVR</span>
          </h1>
          <div className="flex space-x-1 sm:space-x-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950 shadow-lg shadow-amber-500/50'
                      : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-900/50 border border-zinc-800'
                  }`}
                >
                  <span className="hidden sm:inline tracking-wider">{link.shortLabel.toUpperCase()}</span>
                  <span className="sm:hidden">{link.icon}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
