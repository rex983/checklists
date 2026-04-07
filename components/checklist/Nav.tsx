'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Checklists' },
  { href: '/customers', label: 'Customers' },
  { href: '/manufacturers', label: 'Manufacturers' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1">
      {links.map((link) => {
        const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: active ? '#fff' : 'rgba(255,255,255,0.6)',
              background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
            }}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
