'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSearch } from '@/context/SearchContext';

const navLinks = [
  { href: '/#produtos', label: 'Catálogo', sectionId: 'produtos' },
  { href: '/#sobre', label: 'Sobre', sectionId: 'sobre' },
  { href: '/#instagram', label: 'Instagram', sectionId: 'instagram' },
  { href: '/#contato', label: 'Contato', sectionId: 'contato' },
];

export default function Header() {
  const { itemCount } = useCart();
  const { query, setQuery } = useSearch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Intersection Observer — active nav link per section
  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.sectionId);
    const intersecting = new Set<string>();

    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            intersecting.add(id);
          } else {
            intersecting.delete(id);
          }
          // pick topmost intersecting section (DOM order matches sectionIds order)
          const active = sectionIds.find((sid) => intersecting.has(sid)) ?? null;
          setActiveSection(active);
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  // Close search on click outside
  useEffect(() => {
    if (!searchOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [searchOpen]);

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery('');
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') closeSearch();
  }

  return (
    <header className="sticky top-0 z-50 bg-[#151515]/95 backdrop-blur border-b border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/assets/logo-branco.png"
              alt="PaceSportce"
              width={140}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? 'text-[#f4f4f4] font-bold'
                      : 'font-medium text-[#888888] hover:text-[#f4f4f4]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Cart + Mobile Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div ref={searchWrapperRef} className="relative hidden md:flex items-center">
              {searchOpen ? (
                <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-3 py-1.5">
                  <Search size={16} className="text-[#888888] shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Buscar produtos..."
                    className="bg-transparent text-[#f4f4f4] placeholder-[#888888] text-sm w-44 outline-none"
                  />
                  <button onClick={closeSearch} className="text-[#888888] hover:text-[#f4f4f4] transition-colors ml-1">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openSearch}
                  className="p-2 text-[#888888] hover:text-[#f4f4f4] transition-colors"
                  aria-label="Buscar"
                >
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* Cart */}
            <Link href="/carrinho" className="relative p-2 text-[#f4f4f4] hover:text-white transition-colors">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#f4f4f4] text-[#151515] text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-[#f4f4f4]"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-[#2a2a2a] bg-[#151515]">
          {/* Mobile search */}
          <div className="px-6 py-3 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-3 py-2">
              <Search size={16} className="text-[#888888] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="bg-transparent text-[#f4f4f4] placeholder-[#888888] text-sm flex-1 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-[#888888]">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          {navLinks.map((link) => {
            const isActive = activeSection === link.sectionId;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-6 py-3 text-sm hover:bg-[#1e1e1e] transition-colors ${
                  isActive ? 'text-[#f4f4f4] font-bold' : 'text-[#888888] hover:text-[#f4f4f4]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
