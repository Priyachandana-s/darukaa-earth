import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import api from "./api";
import AnalyticsChart from "./AnalyticsChart";

import {
  MapPin,
  Trees,
  BarChart3,
  X,
  CalendarDays,
} from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function MapView({ projectId }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [selectedSite, setSelectedSite] = useState(null);
  const [siteCount, setSiteCount] = useState(0);

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

    const loadSites = async () => {
      try {
        const response = await api.get("/sites/");

        const projectSites = response.data.filter(
          (site) => site.project_id === projectId
        );

        setSiteCount(projectSites.length);

        projectSites.forEach((site) => {
          if (
            site.geometry &&
            site.geometry.type === "Polygon" &&
            site.geometry.coordinates?.length
          ) {
            const sourceId = `site-${site.id}`;

            mapInstance.addSource(sourceId, {
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
              source: sourceId,
              paint: {
                "fill-color": "#2e7d32",
                "fill-opacity": 0.28,
              },
            });

            mapInstance.addLayer({
              id: `site-outline-${site.id}`,
              type: "line",
              source: sourceId,
              paint: {
                "line-color": "#1b5e20",
                "line-width": 3,
              },
            });

            mapInstance.on(
              "click",
              `site-fill-${site.id}`,
              () => {
                setSelectedSite(site);
              }
            );

            mapInstance.on(
              "mouseenter",
              `site-fill-${site.id}`,
              () => {
                mapInstance.getCanvas().style.cursor =
                  "pointer";
              }
            );

            mapInstance.on(
              "mouseleave",
              `site-fill-${site.id}`,
              () => {
                mapInstance.getCanvas().style.cursor =
                  "";
              }
            );
          }
        });
      } catch (error) {
        console.error("Error loading sites:", error);
      }
    };

    mapInstance.on("load", loadSites);

    mapInstance.on("draw.create", async (event) => {
      const geometry = event.features[0].geometry;

      try {
        await api.post("/sites/", {
          name: "New Forest Site",
          description: "Site created from map",
          project_id: projectId,
          geometry,
        });

        setSiteCount((count) => count + 1);

        alert("Site saved successfully!");

        window.location.reload();
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
    <div className="map-wrapper">

      {/* MAP TOOLBAR INFO */}
      <div className="map-info-bar">
        <div className="map-info-item">
          <MapPin size={17} />
          <span>Interactive Map</span>
        </div>

        <div className="map-info-item">
          <Trees size={17} />
          <span>
            {siteCount} site
            {siteCount !== 1 ? "s" : ""} mapped
          </span>
        </div>

        <div className="map-instruction">
          Use the polygon tool to draw a new site
        </div>
      </div>

      {/* MAP */}
      <div
        ref={mapContainer}
        className="map-container"
      />

      {/* SITE DETAILS */}
      {selectedSite && (
        <div className="site-details-panel">

          <div className="site-details-header">

            <div className="site-title-area">
              <div className="site-icon">
                <MapPin size={21} />
              </div>

              <div>
                <span>SELECTED SITE</span>
                <h3>{selectedSite.name}</h3>
              </div>
            </div>

            <button
              className="close-site-button"
              onClick={() => setSelectedSite(null)}
              aria-label="Close site details"
            >
              <X size={20} />
            </button>

          </div>

          <div className="site-meta-grid">

            <div className="site-meta-card">
              <span>Site ID</span>
              <strong>#{selectedSite.id}</strong>
            </div>

            <div className="site-meta-card">
              <span>Project ID</span>
              <strong>#{selectedSite.project_id}</strong>
            </div>

          </div>

          <div className="site-description">
            <span>Description</span>

            <p>
              {selectedSite.description ||
                "No description available for this site."}
            </p>
          </div>

          <div className="analytics-heading">
            <div>
              <div className="analytics-title">
                <BarChart3 size={20} />
                <h3>Performance Analytics</h3>
              </div>

              <p>
                Environmental performance over time
              </p>
            </div>

            <CalendarDays size={20} />
          </div>

          <div className="analytics-container">
            <AnalyticsChart
              siteId={selectedSite.id}
            />
          </div>

        </div>
      )}

    </div>
  );
}

export default MapView;