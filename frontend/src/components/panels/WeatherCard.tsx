"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type WeatherDataType = {
  id: string;
  date: string;
  location: string;
  notes: string;
  weather: {
    temperature: number;
    description: string[];
    humidity: number;
    wind_speed: number;
    uv_index: number;
    icon: string;
    feelslike?: number;
    visibility?: number;
    sunrise?: string;
    sunset?: string;
    air_quality?: Record<string, unknown>;
  };
  geo: {
    lat: number;
    lon: number;
    timezone: string;
  };
};

interface WeatherCardProps {
  weatherId: string;
  direction: "right" | "left";
  onClose: () => void;
}

export function WeatherCard({
  weatherId,
  direction,
  onClose,
}: WeatherCardProps) {
  const [data, setData] = useState<WeatherDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/weather/${weatherId}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail ?? "Failed to fetch weather");
        }
        return res.json();
      })
      .then((json: WeatherDataType) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [weatherId]);

  const panelCls = cn(
    "absolute top-0 h-full w-[400px] bg-card text-card-foreground shadow-lg overflow-y-auto",
    direction === "right" ? "right-0" : "left-0"
  );

  if (loading) {
    return (
      <Card className={panelCls}>
        <CardHeader>
          <CardTitle>Loading…</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={panelCls}>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription className="text-red-500">
            {error ?? "Unknown error"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button onClick={onClose} className="mt-4 text-sm underline">
            Close
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={panelCls}>
      <CardHeader className="flex items-start justify-between">
        <div>
          <CardTitle className="text-2xl capitalize">{data.location}</CardTitle>
          <CardDescription>{data.date}</CardDescription>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>ID:</strong>{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">{data.id}</code>
          </p>
        </div>
        <button onClick={onClose} aria-label="Close">
          <X className="size-4" />
        </button>
      </CardHeader>

      <CardContent className="space-y-3 pb-6 text-sm">
        <div className="flex items-center gap-3">
          <img
            src={data.weather.icon}
            alt={data.weather.description[0]}
            className="w-12 h-12"
          />
          <span className="text-lg font-medium">
            {data.weather.description[0]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <p><strong>Temp:</strong> {data.weather.temperature}°C</p>
          <p><strong>Feels Like:</strong> {data.weather.feelslike ?? "N/A"}°C</p>
          <p><strong>Humidity:</strong> {data.weather.humidity}%</p>
          <p><strong>Wind:</strong> {data.weather.wind_speed} km/h</p>
          <p><strong>UV Index:</strong> {data.weather.uv_index}</p>
          <p><strong>Visibility:</strong> {data.weather.visibility ?? "N/A"} km</p>
          <p><strong>Sunrise:</strong> {data.weather.sunrise ?? "N/A"}</p>
          <p><strong>Sunset:</strong> {data.weather.sunset ?? "N/A"}</p>
        </div>

        <hr className="border-border my-2" />

        <div>
          <h4 className="font-semibold text-sm mb-1">Location Info</h4>
          <p><strong>Lat:</strong> {data.geo.lat}</p>
          <p><strong>Lon:</strong> {data.geo.lon}</p>
          <p><strong>Timezone:</strong> {data.geo.timezone}</p>
        </div>

        {data.notes && (
          <>
            <hr className="border-border my-2" />
            <p className="text-muted-foreground">📝 Notes: {data.notes}</p>
          </>
        )}

        {data.weather.air_quality &&
          Object.keys(data.weather.air_quality).length > 0 && (
            <>
              <hr className="border-border my-2" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Air Quality</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(data.weather.air_quality, null, 2)}
                </pre>
              </div>
            </>
          )}
      </CardContent>
    </Card>
  );
}
