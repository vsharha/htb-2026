/** A point on the screen, in pixels, standing for one map marker. */
export type ScreenPoint = { id: string; x: number; y: number };

/**
 * Groups markers that would overlap. Each marker joins the first group whose
 * first member is within `radius` pixels, or starts its own group, so groups
 * keep the order of the list and a lone marker is a group of one.
 */
export function clusterByDistance<T extends ScreenPoint>(points: T[], radius: number): T[][] {
  const groups: T[][] = [];
  for (const point of points) {
    const home = groups.find(([seed]) => Math.hypot(seed.x - point.x, seed.y - point.y) < radius);
    if (home) home.push(point);
    else groups.push([point]);
  }
  return groups;
}

/** Where a longitude and latitude fall on the world map at a zoom level, in pixels. Only distances between points matter here. */
export function worldPixel(longitude: number, latitude: number, zoom: number) {
  const size = 512 * 2 ** zoom;
  const sin = Math.sin((latitude * Math.PI) / 180);
  return {
    x: ((longitude + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  };
}
