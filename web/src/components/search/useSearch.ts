"use client";

import { useMemo, useState } from "react";

export function useSearch<T>(
  items: T[],
  matcher: (item: T, query: string) => boolean,
) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return items;
    return items.filter((item) => matcher(item, query.toLowerCase()));
  }, [items, query, matcher]);

  return { query, setQuery, results };
}
