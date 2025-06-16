"use client";

import { useEffect, useState } from "react";
import { getGitHubStats } from "@/lib/github";

export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        setLoading(true);
        setError(false);
        const stats = await getGitHubStats("Daggahh", "flow3.chat");
        if (stats) {
          setStars(stats.stargazers_count);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching stars:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, []);

  if (loading) {
    return <span className="text-xs font-medium opacity-50">...</span>;
  }

  if (error || stars === null) {
    return null;
  }

  return <span className="text-xs font-medium text-zinc-50 dark:text-zinc-900">{stars.toLocaleString()}</span>;
}
