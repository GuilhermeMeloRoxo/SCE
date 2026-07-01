"use client"
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { buscarListaUsernames } from "@/services/profile";
import { LoadingIcon, ProfileIcon } from "@/components/Icons";

export function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ username: string; avatar?: string }>>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const handleSearchIconClick = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(async () => {
      try {
        const data = await buscarListaUsernames(query);
        setResults(data || []);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [query]);

  // control dropdown mount/unmount with animation
  useEffect(() => {
    const shouldBeVisible = isFocused && query.length > 0;
    if (shouldBeVisible) {
      setDropdownVisible(true);
      // next frame to ensure transition runs
      requestAnimationFrame(() => setAnimateIn(true));
    } else if (dropdownVisible) {
      setAnimateIn(false);
      const t = window.setTimeout(() => setDropdownVisible(false), 200);
      return () => window.clearTimeout(t);
    }
  }, [isFocused, query, dropdownVisible]);

  

  return (
    <div className="relative w-full max-w-md">
      <form
        className="search flex items-center w-full"
        id="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Pesquisar..."
          id="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 150);
          }}
          className="w-full"
        />

        {!isFocused ? (
          <button id="btn-search" type="button" onClick={handleSearchIconClick}>
            <span className="material-symbols-outlined !text-2xl">search</span>
          </button>
        ) : (
          <button id="btn-send" type="submit">
            <span className="material-symbols-outlined !text-2xl">send</span>
          </button>
        )}
      </form>
      {(isFocused && query.length > 0) && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <LoadingIcon className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <ul>
              {results.length > 0 ? (
                results.map((r) => (
                  <li key={r.username} className="border-b border-gray-100 last:border-b-0 ">
                    <Link
                      href={`/perfil/${r.username}`}
                      onClick={() => {
                        setResults([]);
                        setIsFocused(false);
                      }}
                      className="flex items-center gap-4 p-4 hover:bg-gray-200 w-full"
                    >
                      {r.avatar ? (
                        <Image
                          src={r.avatar}
                          alt={r.username}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center text-gray-500">
                          <ProfileIcon className="w-10 h-10 text-[#087487]" />
                        </div>
                      )}
                      <span className="text-base font-medium">{r.username}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="flex items-center justify-center p-6 text-center text-sm text-gray-500">Nenhum usuário encontrado.</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}