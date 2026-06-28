import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
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

  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );

  // On mount: if permission is already granted, silently detect location
  // without showing any dialog. The SelectLocationScreen handles first-time requests.
  useEffect(() => {
    const autoDetectIfPermitted = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        await startLocationTracking();
      }
    };

    autoDetectIfPermitted();

    return () => {
      watchSubscriptionRef.current?.remove();
    };
  }, []);

  const geocodeCoords = async (
    latitude: number,
    longitude: number,
  ): Promise<void> => {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results.length > 0) {
      setAddress(results[0]);
    }
  };

  const startLocationTracking = async (): Promise<void> => {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setLocation(current);
    await geocodeCoords(current.coords.latitude, current.coords.longitude);

    // Start watcher only if not already active
    if (!watchSubscriptionRef.current) {
      watchSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10_000,
          distanceInterval: 50,
        },
        async (updated) => {
          setLocation(updated);
          await geocodeCoords(
            updated.coords.latitude,
            updated.coords.longitude,
          );
        },
      );
    }
  };

  /**
   * Request foreground location permission (shows the OS dialog on first call).
   * On subsequent calls, permission is already granted so no dialog appears.
   */
  const requestLocation = async (): Promise<void> => {
    if (isRequestingLocation) return;

    setIsRequestingLocation(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied");
        return;
      }
      await startLocationTracking();
    } catch (e: any) {
      setError(e?.message ?? "An error occurred while fetching location");
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const setLocationByCoords = async (
    latitude: number,
    longitude: number,
  ): Promise<void> => {
    setIsRequestingLocation(true);
    setError(null);
    try {
      await geocodeCoords(latitude, longitude);
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
    } catch (e: any) {
      setError(e?.message ?? "Could not resolve location");
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
