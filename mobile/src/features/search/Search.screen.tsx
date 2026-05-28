import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStores } from "../../hooks/useStores";
import { StoreCard } from "../home/components/StoreCard";
import { SearchSkeleton } from "./components/SearchSkeleton";
import { Store } from "../../services/store/store.service";

const HISTORY_KEY = "@mismish_search_history";
const MAX_HISTORY = 10;
const FALLBACK = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800";

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center pb-32">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-5">
        <Ionicons name="search" size={36} color="#FF7F50" />
      </View>
      <Text className="text-[#111] font-black text-[20px] mb-2">
        What are you craving today?
      </Text>
      <Text className="text-gray-400 font-medium text-[14px] text-center px-10">
        Search for your favorite stores and we'll help you find the nearest one
      </Text>
    </View>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <View className="flex-1 items-center justify-center pb-32">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-5">
        <Feather name="search" size={36} color="#ccc" />
      </View>
      <Text className="text-[#111] font-black text-[18px] mb-2">No results found</Text>
      <Text className="text-gray-400 font-medium text-[14px] text-center px-10">
        No stores match "{query}"
      </Text>
    </View>
  );
}

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const { data: stores, isLoading } = useStores();

  // Load history on mount
  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then(raw => {
      if (raw) setHistory(JSON.parse(raw));
    });
  }, []);

  const saveToHistory = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < 2) return;
    setHistory(prev => {
      const updated = [trimmed, ...prev.filter(h => h !== trimmed)].slice(0, MAX_HISTORY);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback(async (term: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => h !== term);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  // Debounce + save history on results
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery("");
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim() || !stores) return [];
    const q = debouncedQuery.toLowerCase();
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.listings.some((l) => l.name.toLowerCase().includes(q)),
    );
  }, [debouncedQuery, stores]);

  // Save to history when results come in
  useEffect(() => {
    if (results.length > 0) saveToHistory(debouncedQuery);
  }, [results, debouncedQuery, saveToHistory]);

  const applyHistory = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const renderStore = ({ item: store }: { item: Store }) => {
    const firstBag = store.listings[0];
    const totalLeft = store.listings.reduce((sum, l) => sum + l.quantity, 0);
    return (
      <StoreCard
        storeId={store.id}
        title={store.name}
        branch={store.category ?? store.address?.split(",")[0] ?? ""}
        price={firstBag ? `${firstBag.price} SAR` : "—"}
        timeRange={
          firstBag ? `${fmtTime(firstBag.pickupStart)} - ${fmtTime(firstBag.pickupEnd)}` : "—"
        }
        distance="—"
        imageUrl={store.imageUrl ?? FALLBACK}
        logoUrl={store.imageUrl ?? FALLBACK}
        leftCount={`${totalLeft} bag${totalLeft !== 1 ? "s" : ""} left`}
        hasListings={totalLeft > 0}
        rating={store.rating}
        reviewCount={store.reviewCount}
      />
    );
  };

  const showSkeleton = isLoading || isSearching;
  const showHistory = !showSkeleton && !query.trim() && history.length > 0;
  const showEmpty = !showSkeleton && !query.trim() && history.length === 0;
  const showNoResults = !showSkeleton && debouncedQuery.trim().length > 0 && results.length === 0;
  const showResults = !showSkeleton && results.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Search bar header */}
      <View className="flex-row items-center px-4 pt-2 pb-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 items-center justify-center mr-2"
        >
          <Feather name="arrow-left" size={22} color="#111" />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center bg-gray-50 border border-gray-200 rounded-full px-4 h-11">
          <Ionicons name="search" size={18} color="#FF7F50" />
          <TextInput
            ref={inputRef}
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search for restaurants or meals"
            placeholderTextColor="#aaa"
            className="flex-1 text-[#111] text-[14px] font-medium ml-2"
            returnKeyType="search"
            clearButtonMode="never"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <View className="w-5 h-5 rounded-full bg-gray-300 items-center justify-center">
                <Feather name="x" size={12} color="#666" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {showSkeleton ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          renderItem={() => null}
          ListHeaderComponent={<SearchSkeleton />}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : showHistory ? (
        <View className="flex-1 px-5 pt-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#111] font-black text-[16px]">Recent Search</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text className="text-gray-400 text-[13px] font-semibold">Clear All</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {history.map(term => (
              <View
                key={term}
                className="flex-row items-center border border-gray-200 rounded-full px-3 py-1.5 bg-white"
              >
                <Feather name="clock" size={13} color="#aaa" style={{ marginRight: 6 }} />
                <TouchableOpacity onPress={() => applyHistory(term)}>
                  <Text className="text-[#333] text-[13px] font-semibold">{term}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeFromHistory(term)}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  style={{ marginLeft: 6 }}
                >
                  <Feather name="x" size={12} color="#bbb" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : showEmpty ? (
        <EmptyState />
      ) : showNoResults ? (
        <NoResults query={query} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderStore}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
