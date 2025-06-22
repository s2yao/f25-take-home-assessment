"use client";

import { WeatherForm } from "@/components/weather-form";
import { LookupForm } from "@/components/lookup-form";
import { WeatherCard } from "@/components/panels/WeatherCard";
import { CityListCard } from "@/components/panels/CityCard";
import { useState } from "react";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<{ city: string; id: string } | null>(null);
  // for forcing re-render of CityListCard
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-background p-8 relative">
    
    {selectedCity && (
      <WeatherCard
        direction="right"
        weatherId={selectedCity.id}
        onClose={() => setSelectedCity(null)}
      />
    )}


    <CityListCard
      key={refreshKey}
      onSelect={(cityInfo) => setSelectedCity(cityInfo)}
    />


      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Weather System
          </h1>
          <p className="text-muted-foreground text-lg">
            Submit weather requests and retrieve stored results
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col items-center justify-start">
            <h2 className="text-2xl font-semibold mb-4">
              Submit Weather Request
            </h2>
            <WeatherForm onSuccess={() => setRefreshKey((prev) => prev + 1)} />
          </div>

          <div className="flex flex-col items-center justify-start">
            <h2 className="text-2xl font-semibold mb-4">
              Lookup Weather Data
            </h2>
            <LookupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
