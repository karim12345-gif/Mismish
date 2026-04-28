import React, { createContext, useState, useContext, ReactNode } from "react";
import * as Location from "expo-location";

interface LocationContextType {
  location: Location.LocationObject | null;
  address: Location.LocationGeocodedAddress | null;
  isRequestingLocation: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  setLocationByCoords: (latitude: number, longitude: number) => Promise<void>;
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

  const setLocationByCoords = async (latitude: number, longitude: number) => {
    setIsRequestingLocation(true);
    setError(null);
    try {
      const geocodedList = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (geocodedList && geocodedList.length > 0) {
        setAddress(geocodedList[0]);
        setLocation({
          coords: {
            latitude,
            longitude,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as Location.LocationObject);
      }
    } catch (e: any) {
      setError(e.message || "Could not resolve location");
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const [watchSubscription, setWatchSubscription] =
    useState<Location.LocationSubscription | null>(null);

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

      // 1. Initial fetch
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

      // 2. Continuous watcher
      if (!watchSubscription) {
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 2000,
            distanceInterval: 10,
          },
          async (newLoc) => {
            setLocation(newLoc);
            const geo = await Location.reverseGeocodeAsync({
              latitude: newLoc.coords.latitude,
              longitude: newLoc.coords.longitude,
            });
            if (geo && geo.length > 0) {
              setAddress(geo[0]);
            }
          },
        );
        setWatchSubscription(sub);
      }
    } catch (e: any) {
      setError(e.message || "An error occurred while fetching location");
    } finally {
      setIsRequestingLocation(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (watchSubscription) {
        watchSubscription.remove();
      }
    };
  }, [watchSubscription]);

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        isRequestingLocation,
        error,
        requestLocation,
        setLocationByCoords,
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
