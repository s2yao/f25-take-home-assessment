import uvicorn
import uuid
import os
import requests
from fastapi import FastAPI, HTTPException
from starlette import status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
from dotenv import load_dotenv

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
# dictionary within a dictionary
# first string is the unique ID
# second dictionary contains the weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

# Stack to track cities
city_stack: list[tuple[str, str]] = []
# Set to let cities unique
city_set: set[str] = set()

# parses the data from request body
class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str


# Load environment variables from .env file
load_dotenv()
WEATHERSTACK_API_KEY = os.getenv("WEATHERSTACK_API_KEY")
if not WEATHERSTACK_API_KEY:
    raise ValueError("WEATHERSTACK_API_KEY is not set in the environment variables")

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    You need to implement this endpoint to handle the following:
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """
    # 1. Generate a unique ID
    weather_id = str(uuid.uuid4())

    # 2. Call the WeatherStack API
    url = f"http://api.weatherstack.com/current"
    params = {
        "access_key": WEATHERSTACK_API_KEY,
        "query": request.location,
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if response.status_code != 200 or "current" not in data:
            raise HTTPException(status_code=400, detail="Not a real city or location not found")

        # 3. Store the combined data in memory
        location = request.location.strip().lower()

        city_key = f"{location}_{request.date}"
        if city_key not in city_set:
            city_set.add(city_key)
            city_stack.append((location, weather_id))
            weather_storage[weather_id] = {
                "id": weather_id,
                "date": request.date,
                "location": location,
                "notes": request.notes,
                "weather": {
                    "temperature": data["current"]["temperature"],
                    "description": data["current"]["weather_descriptions"],
                    "humidity": data["current"]["humidity"],
                    "wind_speed": data["current"]["wind_speed"],
                    "uv_index": data["current"]["uv_index"],
                    "icon": data["current"]["weather_icons"][0],
                    "feelslike": data["current"]["feelslike"],
                    "visibility": data["current"]["visibility"],
                    "sunrise": data["current"].get("astro", {}).get("sunrise", "N/A"),
                    "sunset": data["current"].get("astro", {}).get("sunset", "N/A"),
                    "air_quality": data["current"].get("air_quality", {})
                },
                "geo": {
                    "lat": data["location"]["lat"],
                    "lon": data["location"]["lon"],
                    "timezone": data["location"]["timezone_id"]
                }
            }
            print("[DEBUG] weather_storage:", weather_storage, flush=True)

        # 4. Return the ID to frontend
            return {"id": weather_id}
        else:
            print("[DEBUG] weather_storage:", weather_storage, flush=True)

            raise HTTPException(
                status_code=400,
                detail="This city has already been submitted for that date."
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


@app.get("/history")
async def get_city_history():
    """
    Returns the stack of submitted cities (most-recent at end of list).
    """
    return city_stack


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)