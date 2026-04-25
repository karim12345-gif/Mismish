import React, { createContext, useState, useContext, ReactNode } from "react";
import * as Location from "expo-location";

interface LocationContextType {
  location: Location.LocationObject | null;
  address: Location.LocationGeocodedAddress | null;
  isRequestingLocation: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [address, setAddress] =
    useState<Location.LocationGeocodedAddress | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    // Prevent overlapping requests
    if (isRequestingLocation) return;

    setIsRequestingLocation(true);
    setError(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied");
        setIsRequestingLocation(false);
        return;
      }

      let currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });
      setLocation(currentLoc);

      let geocodedList = await Location.reverseGeocodeAsync({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });

      if (geocodedList && geocodedList.length > 0) {
        setAddress(geocodedList[0]);
      }
    } catch (e: any) {
      setError(e.message || "An error occurred while fetching location");
    } finally {
      setIsRequestingLocation(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        isRequestingLocation,
        error,
        requestLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
