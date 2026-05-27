import { Request, Response, NextFunction } from "express";

export const searchPlaces = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length < 2) {
      res.status(400).json({ status: "error", message: "Query too short" });
      return;
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", `${query}, Riyadh, Saudi Arabia`);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "8");
    url.searchParams.set("countrycodes", "sa");
    url.searchParams.set("viewbox", "46.4,24.5,47.0,25.0"); // Riyadh bounding box
    url.searchParams.set("bounded", "1");

    const response = await fetch(url.toString(), {
      headers: {
        // Nominatim requires a User-Agent identifying your app
        "User-Agent": "Mismish/1.0 (mismish.app)",
        "Accept-Language": "en,ar",
      },
    });

    if (!response.ok) throw new Error("Nominatim request failed");

    const raw: any[] = await response.json();

    const results = raw.map((place) => ({
      placeId:     place.place_id,
      name:        place.name || place.display_name.split(",")[0],
      displayName: place.display_name,
      address:     formatAddress(place),
      latitude:    parseFloat(place.lat),
      longitude:   parseFloat(place.lon),
      type:        place.type,
    }));

    res.json({ status: "success", data: results });
  } catch (e) {
    next(e);
  }
};

const formatAddress = (place: any): string => {
  const a = place.address || {};
  const parts = [
    a.road,
    a.neighbourhood || a.suburb,
    a.city_district,
    "Riyadh",
  ].filter(Boolean);
  return parts.join(", ");
};
