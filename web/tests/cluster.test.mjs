import assert from "node:assert/strict";
import test from "node:test";
import { clusterByDistance, worldPixel } from "../src/lib/cluster.ts";

test("markers within the radius share a group, in list order", () => {
  const points = [
    { id: "a", x: 0, y: 0 },
    { id: "b", x: 10, y: 0 },
    { id: "c", x: 100, y: 0 },
    { id: "d", x: 105, y: 3 },
  ];
  assert.deepEqual(clusterByDistance(points, 26).map((g) => g.map((p) => p.id)), [["a", "b"], ["c", "d"]]);
});

test("a lone marker is a group of one and nothing is lost", () => {
  const points = [{ id: "a", x: 0, y: 0 }, { id: "b", x: 500, y: 500 }];
  const groups = clusterByDistance(points, 26);
  assert.equal(groups.length, 2);
  assert.equal(groups.flat().length, 2);
});

test("the same two places are further apart in pixels when zoomed in", () => {
  const distance = (zoom) => {
    const a = worldPixel(-73.99, 40.75, zoom);
    const b = worldPixel(-73.98, 40.75, zoom);
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  assert.ok(distance(14) > distance(10) * 15);
});
