import { Store } from "../../services/store/store.service";
import { ClusterItem } from "./MapScreen.types";

const CLUSTER_ZOOM_THRESHOLD = 0.06;
const CLUSTER_GRID_RATIO = 0.28;

export const FLY_DELTA = 0.08;

export function clusterBubbleSize(count: number): number {
  if (count < 10) return 46;
  if (count < 30) return 54;
  return 62;
}

export function buildClusters(stores: Store[], latDelta: number): ClusterItem[] {
  const valid = stores.filter((s) => s.latitude != null && s.longitude != null);

  if (latDelta < CLUSTER_ZOOM_THRESHOLD) {
    return valid.map((s) => ({
      isCluster: false,
      count: 1,
      latitude: s.latitude!,
      longitude: s.longitude!,
      store: s,
    }));
  }

  const gridSize = latDelta * CLUSTER_GRID_RATIO;
  const visited = new Set<number>();
  const clusters: ClusterItem[] = [];

  for (const store of valid) {
    if (visited.has(store.id)) continue;

    const nearby = valid.filter(
      (s) =>
        !visited.has(s.id) &&
        Math.abs(s.latitude! - store.latitude!) < gridSize &&
        Math.abs(s.longitude! - store.longitude!) < gridSize,
    );
    nearby.forEach((s) => visited.add(s.id));

    const lat = nearby.reduce((sum, s) => sum + s.latitude!, 0) / nearby.length;
    const lng = nearby.reduce((sum, s) => sum + s.longitude!, 0) / nearby.length;

    clusters.push({
      isCluster: nearby.length > 1,
      count: nearby.length,
      latitude: lat,
      longitude: lng,
      store: nearby[0],
    });
  }

  return clusters;
}
