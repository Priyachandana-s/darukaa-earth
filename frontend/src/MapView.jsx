import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import api from "./api";
import AnalyticsChart from "./AnalyticsChart";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function MapView({ projectId }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    if (map.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.5946, 12.9716],
      zoom: 10,
    });

    map.current = mapInstance;

    mapInstance.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });

    mapInstance.addControl(draw, "top-left");

    // -----------------------------
    // Load saved sites
    // -----------------------------
    const loadSites = async () => {
      try {
        const response = await api.get("/sites/");

        response.data.forEach((site) => {
          if (
            site.geometry &&
            site.geometry.type === "Polygon" &&
            site.geometry.coordinates?.length
          ) {
            mapInstance.addSource(`site-${site.id}`, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {
                  name: site.name,
                  description: site.description,
                  siteId: site.id,
                },
                geometry: site.geometry,
              },
            });

            mapInstance.addLayer({
              id: `site-fill-${site.id}`,
              type: "fill",
              source: `site-${site.id}`,
              paint: {
                "fill-opacity": 0.35,
              },
            });

            mapInstance.addLayer({
              id: `site-outline-${site.id}`,
              type: "line",
              source: `site-${site.id}`,
              paint: {
                "line-width": 3,
              },
            });

            // Click polygon
            mapInstance.on(
              "click",
              `site-fill-${site.id}`,
              () => {
                setSelectedSite(site);
              }
            );

            // Pointer cursor
            mapInstance.on(
              "mouseenter",
              `site-fill-${site.id}`,
              () => {
                mapInstance.getCanvas().style.cursor = "pointer";
              }
            );

            mapInstance.on(
              "mouseleave",
              `site-fill-${site.id}`,
              () => {
                mapInstance.getCanvas().style.cursor = "";
              }
            );
          }
        });
      } catch (error) {
        console.error("Error loading sites:", error);
      }
    };

    mapInstance.on("load", loadSites);

    // -----------------------------
    // Save newly drawn polygon
    // -----------------------------
    mapInstance.on("draw.create", async (event) => {
      const geometry = event.features[0].geometry;

      try {
        await api.post("/sites/", {
          name: "New Forest Site",
          description: "Site created from map",
          project_id: projectId,
          geometry: geometry,
        });

        alert("Site saved successfully!");

      } catch (error) {
        console.error("Error saving site:", error);

        alert(
          error.response?.data?.detail ||
          "Failed to save site."
        );
      }
    });

    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, [projectId]);

  return (
    <div>
      {/* Map */}
      <div
        ref={mapContainer}
        className="map-container"
      />

      {/* Site Details */}
      {selectedSite && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Site Details</h3>

          <p>
            <strong>Site Name:</strong>{" "}
            {selectedSite.name}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {selectedSite.description}
          </p>

          <p>
            <strong>Site ID:</strong>{" "}
            {selectedSite.id}
          </p>

          <p>
            <strong>Project ID:</strong>{" "}
            {selectedSite.project_id}
          </p>

          {/* Analytics */}
          <AnalyticsChart
            siteId={selectedSite.id}
          />

          <button
            onClick={() => setSelectedSite(null)}
            style={{
              marginTop: "15px",
              padding: "10px 18px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default MapView;