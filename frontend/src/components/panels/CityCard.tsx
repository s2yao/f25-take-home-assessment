"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
    interface CityListCardProps {
        onSelect?: (info: { city: string; id: string }) => void;
    }
  
  export function CityListCard({ onSelect }: CityListCardProps) {
    const [cities, setCities] = useState<{ city: string; id: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      fetch("http://localhost:8000/history")
        .then((r) => r.json())
        .then((data: [string, string][]) => {
          const mapped = data.map(([city, id]) => ({ city, id })).reverse();
          setCities(mapped);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setError("Could not load city history");
          setLoading(false);
        });
    }, []);
  
    return (
        <Card className="fixed top-16 left-4 z-50 w-[320px] min-h-[70vh] max-h-[80vh] overflow-y-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">City List (Clickable)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 px-2 pb-4">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          {!loading &&
            !error &&
            cities.map(({ city, id }) => (
              <button
                key={id}
                onClick={() => onSelect?.({ city, id })}
                className="w-full text-left px-4 py-2 rounded hover:bg-muted transition"
              >
                {city}
              </button>
            ))}
          {!loading && !error && cities.length === 0 && (
            <p className="text-sm text-muted-foreground">No cities yet</p>
          )}
        </CardContent>
      </Card>
    );
  }
  
