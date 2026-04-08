import { useEffect, useRef, useState } from "react";

/**
 * LocationPicker – renders an ArcGIS MapView centred on the user's geolocation.
 * Calls onChange({ latitude, longitude }) immediately on mount (geolocation) and
 * also whenever the user clicks to pin a different spot on the map.
 */
export const LocationPicker = ({ onChange, error, disabled }) => {
  const mapContainerRef = useRef(null);
  const viewRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [locationStatus, setLocationStatus] = useState("pending"); // pending | granted | denied
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let view = null;

    const initMap = async (centerLng, centerLat) => {
      const [
        { default: MapView },
        { default: Map },
        { default: GraphicsLayer },
        { default: Graphic },
        { default: Point },
        { default: SimpleMarkerSymbol },
      ] = await Promise.all([
        import("@arcgis/core/views/MapView.js"),
        import("@arcgis/core/Map.js"),
        import("@arcgis/core/layers/GraphicsLayer.js"),
        import("@arcgis/core/Graphic.js"),
        import("@arcgis/core/geometry/Point.js"),
        import("@arcgis/core/symbols/SimpleMarkerSymbol.js"),
      ]);

      const markerSymbol = new SimpleMarkerSymbol({
        color: [31, 66, 125],
        outline: { color: [255, 191, 25], width: 2 },
        size: 12,
      });

      const layer = new GraphicsLayer();
      markerLayerRef.current = { layer, Graphic, Point, markerSymbol };

      const map = new Map({ basemap: "streets-navigation-vector" });
      map.add(layer);

      view = new MapView({
        container: mapContainerRef.current,
        map,
        center: [centerLng, centerLat],
        zoom: 15,
        ui: { components: ["zoom"] },
      });

      viewRef.current = view;

      // Draw initial marker
      drawMarker(centerLng, centerLat);

      // Let user re-pin by clicking
      view.on("click", (event) => {
        if (disabled) return;
        const { longitude, latitude } = event.mapPoint;
        drawMarker(longitude, latitude);
        setSelectedCoordinates({ latitude, longitude });
        onChange({ latitude, longitude });
      });
    };

    const drawMarker = (lng, lat) => {
      const { layer, Graphic, Point, markerSymbol } = markerLayerRef.current || {};
      if (!layer) return;
      layer.removeAll();
      const point = new Point({ longitude: lng, latitude: lat });
      layer.add(new Graphic({ geometry: point, symbol: markerSymbol }));
    };

    // Request geolocation first
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      // Default to Amity Noida
      initMap(77.3122, 28.5449);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setLocationStatus("granted");
        setSelectedCoordinates({ latitude, longitude });
        onChange({ latitude, longitude });
        initMap(longitude, latitude);
      },
      () => {
        setLocationStatus("denied");
        // Init map at default but don't call onChange — keeps field invalid until user taps
        initMap(77.3122, 28.5449);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );

    return () => {
      view?.destroy();
      viewRef.current = null;
      markerLayerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="field-group">
      <label className="field-label">
        Location<span className="required-mark">*</span>
      </label>

      {locationStatus === "denied" && (
        <p className="error-text location-permission-warn">
          Location permission denied. Tap on the map to set your location manually.
        </p>
      )}

      <div
        ref={mapContainerRef}
        className={`location-map-container ${error ? "location-map-error" : ""}`}
        aria-label="Map – tap to set location"
      />

      {selectedCoordinates && (
        <p className="location-coordinates" aria-live="polite">
          {selectedCoordinates.latitude.toFixed(6)}, {selectedCoordinates.longitude.toFixed(6)}
        </p>
      )}

      {error && <p className="error-text">{error.message}</p>}
    </div>
  );
};
