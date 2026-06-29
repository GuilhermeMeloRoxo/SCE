"use client"
import { useState, useRef } from "react";
export function SearchBar() {

  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchIconClick = () => {
    inputRef.current?.focus();
  };

  return (
    <form className="search flex items-center" id="search">
      <input
        ref={inputRef}
        type="text"
        placeholder="Pesquisar..."
        id="search-input"
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (e.relatedTarget?.id !== "btn-send") {
            setIsFocused(false);
          }
        }}
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
  );
}