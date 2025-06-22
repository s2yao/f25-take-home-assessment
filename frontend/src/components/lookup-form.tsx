"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface lookupFormData {
  uuid: string;
}

export function LookupForm() {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: {
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
      };
    };
  } | null>(null);
  

 const [formData, setFormData] = useState<lookupFormData>({
    uuid: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
        const response = await fetch(`http://localhost:8000/weather/${formData.uuid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            });
          
        if (response.ok) {
            const data = await response.json();
            setResult({
                success: true,
                message: "Weather data found!",
                data: data,
            });
        } else {
            const errorData = await response.json();
            setResult({
                success: false,
                message: errorData.detail || "Failed to submit weather request",
            });
        }
        } catch {
        setResult({
            success: false,
            message: "Network error: Could not connect to the server",
        });
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lookup Weather ID</CardTitle>
        <CardDescription>
          Submit a weather ID request for lookup existing weather data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="uuid">Enter your Weather ID :D</Label>
            <Input
              id="uuid"
              name="uuid"
              type="text"
              placeholder="Enter your Weather ID"
              value={formData.uuid}
              onChange={handleInputChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Lookup Request"}
          </Button>




          {result && (
            <div
                className={`p-3 rounded-md ${
                result.success
                    ? "bg-green-900/20 text-green-500 border border-green-500"
                    : "bg-red-900/20 text-red-500 border border-red-500"
                }`}
            >
                <p className="text-sm font-medium">{result.message}</p>

                {result.success && result.data && (
                <div className="text-xs mt-2 space-y-1">
                    <p><strong>ID:</strong> {result.data.id}</p>
                    <p><strong>Date:</strong> {result.data.date}</p>
                    <p><strong>Location:</strong> {result.data.location}</p>
                    <p><strong>Notes:</strong> {result.data.notes || "None"}</p>
                    <p><strong>Temperature:</strong> {result.data.weather.temperature}°C</p>
                    <p><strong>Description:</strong> {result.data.weather.description.join(", ")}</p>
                    <p><strong>Humidity:</strong> {result.data.weather.humidity}%</p>
                    <p><strong>Wind Speed:</strong> {result.data.weather.wind_speed} km/h</p>
                    <p><strong>UV Index:</strong> {result.data.weather.uv_index}</p>
                    <img
                    src={result.data.weather.icon}
                    alt="Weather Icon"
                    className="w-8 h-8 mt-1"
                    />
                </div>
                )}
            </div>
            )}
        </form>
      </CardContent>
    </Card>
  );
}
