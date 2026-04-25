import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  StyleSheet,
  Linking,
} from "react-native";
import MapView, { Marker, Circle, Polygon } from "react-native-maps";
import Slider from "@react-native-community/slider";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../components/index";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

const { width, height } = Dimensions.get("window");

const SelectLocationScreen = () => {
  const { setLocationSelected } = useAuth();
  const mapRef = React.useRef<MapView>(null);

  // Default to Dubai
  const [region, setRegion] = useState({
    latitude: 25.2048,
    longitude: 55.2708,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [distance, setDistance] = useState(15); // KM
  const [searchText, setSearchText] = useState("");
  // Generated stores based on the initial region or current location
  const [dummyStores, setDummyStores] = useState<any[]>([]);
  const isExplodingCluster = React.useRef(false);

  // Regenerate stores whenever the region changes (simulating backend clustering)
  const generateStoresForRegion = (currentRegion: any) => {
    // Only generate if we don't have stores or to refresh view (simple demo logic)
    // In a real app, this would be a backend call based on viewport
    const newStores = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      lat:
        currentRegion.latitude +
        (Math.random() - 0.5) * (currentRegion.latitudeDelta * 0.8),
      lng:
        currentRegion.longitude +
        (Math.random() - 0.5) * (currentRegion.longitudeDelta * 0.8),
      count: Math.floor(Math.random() * 20) + 1, // Random count
    }));
    setDummyStores(newStores);
  };

  useEffect(() => {
    generateStoresForRegion(region);
  }, []);

  // Zoom map when distance changes
  useEffect(() => {
    if (mapRef.current) {
      // 1 degree lat ~ 111km.
      // We want to show the circle (diameter = 2*distance) plus some padding (e.g. 1.5x)
      const visibleDiameter = distance * 2 * 1.5;
      const newDelta = visibleDiameter / 111;

      const newRegion = {
        ...region,
        latitudeDelta: newDelta,
        longitudeDelta: newDelta * (width / height),
      };

      mapRef.current.animateToRegion(newRegion, 500);
      // Stores will regenerate via onRegionChangeComplete
    }
  }, [distance]);

  const handleSearch = async () => {
    if (!searchText) return;

    try {
      const geocodedLocation = await Location.geocodeAsync(searchText);
      if (geocodedLocation.length > 0) {
        const { latitude, longitude } = geocodedLocation[0];
        const newRegion = {
          ...region,
          latitude,
          longitude,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      } else {
        Alert.alert("Location not found", "Please try a different city name.");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not search for location.");
    }
  };

  const handleSelect = () => {
    // Here you would typically save the selected location/radius to backend/context
    console.log("Selected Location:", region, "Radius:", distance, "KM");
    setLocationSelected();
    // Navigation will be handled by RootNavigator state change
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Please enable location services in your settings to use this feature.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const newRegion = {
      ...region,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
    // Stores will regenerate via onRegionChangeComplete
  };

  const handleMarkerPress = (store: any) => {
    // Zoom in on the marker
    const newLatDelta = region.latitudeDelta / 4; // Zoom in 4x
    const newLngDelta = region.longitudeDelta / 4;

    const newRegion = {
      latitude: store.lat,
      longitude: store.lng,
      latitudeDelta: newLatDelta,
      longitudeDelta: newLngDelta,
    };

    // If it's a "cluster" (count > 1), we want to preserve the exploded stores
    if (store.count > 1) {
      isExplodingCluster.current = true; // Tell onRegionChangeComplete to skip generation
    }

    mapRef.current?.animateToRegion(newRegion, 500);
    setRegion(newRegion);

    // If it's a "cluster" (count > 1), explode it into individual stores
    if (store.count > 1) {
      const expandedStores = Array.from({
        length: Math.min(store.count, 5),
      }).map((_, i) => ({
        id: Date.now() + i,
        lat: store.lat + (Math.random() - 0.5) * (newLatDelta * 0.4),
        lng: store.lng + (Math.random() - 0.5) * (newLngDelta * 0.4),
        count: 1, // Single store
      }));
      setDummyStores(expandedStores);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={(r) => {
          setRegion(r);
          // Debounce could be added here, but for now we just regenerate
          if (isExplodingCluster.current) {
            isExplodingCluster.current = false; // Reset after one skip
          } else {
            generateStoresForRegion(r);
          }
        }}
      >
        {/* Inverse Circle Overlay (Dim outside) */}
        <Polygon
          coordinates={[
            // Global Bounds (Clockwise)
            { latitude: 85, longitude: -180 },
            { latitude: 85, longitude: 180 },
            { latitude: -85, longitude: 180 },
            { latitude: -85, longitude: -180 },
            { latitude: 85, longitude: -180 },
          ]}
          holes={[
            // Inner Circle approximation (Counter-Clockwise)
            Array.from({ length: 360 })
              .map((_, i) => {
                const angle = (i * Math.PI) / 180;
                // Convert km radius to degrees (rough approximation: 111km per degree lat)
                const latRadius = distance / 111;
                const lngRadius =
                  distance /
                  (111 * Math.cos(region.latitude * (Math.PI / 180)));
                return {
                  latitude: region.latitude + latRadius * Math.cos(angle),
                  longitude: region.longitude + lngRadius * Math.sin(angle),
                };
              })
              .reverse(),
          ]}
          fillColor="rgba(0, 0, 0, 0.5)" // Dimmed background
          strokeColor="transparent"
          strokeWidth={0}
        />

        <Marker coordinate={region}>
          <Ionicons name="location-sharp" size={40} color="#146566" />
        </Marker>

        {/* Dummy Stores */}
        {dummyStores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{ latitude: store.lat, longitude: store.lng }}
            onPress={(e) => {
              e.stopPropagation(); // Prevent map press
              handleMarkerPress(store);
            }}
          >
            <View style={{ alignItems: "center" }}>
              <StyledView
                className={`p-1.5 rounded-lg items-center justify-center min-w-[36px] min-h-[36px] ${store.count > 1 ? "bg-[#146566]" : "bg-[#F59E0B]"}`}
              >
                <Text className="text-white font-bold text-xs">
                  {store.count > 1 ? store.count : "1"}
                </Text>
              </StyledView>
              <StyledView
                className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-[1px] ${store.count > 1 ? "border-t-[#146566]" : "border-t-[#F59E0B]"}`}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Bottom Sheet Control Panel */}
      <StyledView className="absolute bottom-0 w-full bg-[#146566] rounded-t-[32px] px-6 pt-8 pb-10 h-[50%] justify-between">
        <View>
          <StyledText className="text-white text-2xl font-bold text-center mb-6">
            Select a distance
          </StyledText>

          <View className="flex-row items-center justify-between mb-2">
            {/* Slider Range Text could go here if needed */}
          </View>

          <View className="flex-row items-center space-x-4 mb-6">
            <Slider
              style={{ flex: 1, height: 40 }}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor="#F59E0B"
              maximumTrackTintColor="#FFFFFF"
              thumbTintColor="#FFFFFF"
              accessible={true}
              accessibilityLabel="Distance Slider"
            />
            <StyledText className="text-white font-bold text-lg min-w-[60px]">
              {distance} KM
            </StyledText>
          </View>

          {/* Search Bar */}
          <StyledView className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-6">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <StyledTextInput
              placeholder="Search for a city"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-base text-black"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </StyledView>

          {/* Use Current Location */}
          <StyledTouchableOpacity
            onPress={getCurrentLocation}
            className="flex-row items-center justify-center mb-6"
          >
            <Ionicons name="navigate" size={20} color="white" />
            <StyledText className="text-white ml-2 font-medium">
              Use my current Location
            </StyledText>
          </StyledTouchableOpacity>
        </View>

        {/* Select Button */}
        <Button
          label="Select"
          onPress={handleSelect}
          variant="primary"
          className="w-full bg-[#F59E0B] border-0"
          textClassName="text-white font-bold text-lg"
        />
      </StyledView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height * 0.6, // Map takes top 60% (overlapping with bottom sheet)
  },
});

export default SelectLocationScreen;
