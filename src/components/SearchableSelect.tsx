'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onSelect: (value: string | number) => void;
  placeholder?: string;
}

export default function SearchableSelect({
  options,
  value,
  onSelect,
  placeholder = 'Pilih...',
}: SearchableSelectProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search term
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-left shadow-sm transition hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
      >
        <span className="truncate text-sm font-medium text-slate-900">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {/* Search Input */}
          <div className="flex items-center border-b border-slate-100 bg-slate-50 px-3 py-2">
            <Search className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ketik untuk mencari..."
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Filtered Options List */}
          <ul className="max-h-52 overflow-y-auto divide-y divide-slate-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onSelect(opt.value);
                    setOpen(false);
                    setSearchTerm('');
                  }}
                  className="cursor-pointer px-3.5 py-2.5 transition-colors hover:bg-slate-50"
                >
                  <p className="text-xs font-semibold text-slate-800">
                    {opt.label}
                  </p>
                  {opt.sublabel && (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {opt.sublabel}
                    </p>
                  )}
                </li>
              ))
            ) : (
              <li className="px-3.5 py-4 text-center text-xs text-slate-400 italic">
                Tidak ada pilihan yang cocok
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
