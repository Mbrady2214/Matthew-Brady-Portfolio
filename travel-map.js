/*
 * Interactive travel map controller.
 * This file intentionally keeps all editable trip content in travelData.js.
 */
(function initTravelMapFeature() {
    const mapElement = document.getElementById("travel-map");

    // Only run on pages that include the travel map section.
    if (!mapElement || !window.maplibregl || !window.travelData) {
        return;
    }

    const drawer = document.getElementById("travel-drawer");
    const drawerClose = document.getElementById("travel-drawer-close");
    const drawerGallery = document.getElementById("travel-drawer-gallery");

    const map = new maplibregl.Map({
        container: "travel-map",
        style: {
            version: 8,
            glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
            sources: {
                lightRaster: {
                    type: "raster",
                    tiles: [
                        "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    ],
                    tileSize: 256,
                    attribution: "(c) OpenStreetMap contributors (c) CARTO"
                }
            },
            layers: [
                {
                    id: "light-raster-base",
                    type: "raster",
                    source: "lightRaster"
                }
            ]
        },
        center: [15, 23],
        zoom: 1.45,
        minZoom: 1,
        maxZoom: 8,
        renderWorldCopies: true
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    map.on("style.load", async () => {
        // Globe projection makes the interaction feel more immersive.
        map.setProjection({ type: "globe" });

        const loadedFlagPatterns = await loadFlagPatterns(map, travelData.visitedCountries);
        await loadCountryOverlay(map, travelData.visitedCountries, loadedFlagPatterns);
        createTravelMarkers(map, travelData.locations);
    });

    drawerClose?.addEventListener("click", closeTravelDrawer);
    mapElement.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeTravelDrawer();
        }
    });

    function closeTravelDrawer() {
        if (!drawer) {
            return;
        }

        drawer.classList.remove("is-open");
        window.setTimeout(() => {
            drawer.hidden = true;
        }, 200);
    }

    function openTravelDrawer(location) {
        if (!drawer || !drawerGallery) {
            return;
        }

        drawerGallery.innerHTML = "";

        (location.tripPhotos || []).forEach((photoPath, photoIndex) => {
            const image = document.createElement("img");
            image.src = photoPath;
            image.alt = `${location.city} trip photo ${photoIndex + 1}`;
            image.loading = "lazy";
            image.addEventListener("error", () => {
                image.src = "images/profile-picture.png";
            });
            drawerGallery.appendChild(image);
        });

        drawer.hidden = false;
        // allow hidden->visible style recalculation before adding class
        window.requestAnimationFrame(() => {
            drawer.classList.add("is-open");
        });
    }

    async function loadFlagPatterns(mapInstance, visitedCountries) {
        const loadedPatternCodes = new Set();

        for (const country of visitedCountries) {
            const iso = (country.isoA2 || "").toUpperCase();
            const patternId = `flag-${iso}`;

            if (!iso || !country.flagTexture) {
                continue;
            }

            try {
                const loadedImage = await mapInstance.loadImage(country.flagTexture);
                mapInstance.addImage(patternId, loadedImage.data);
                loadedPatternCodes.add(iso);
            } catch (error) {
                // If an image is missing, we keep the country on gold fallback fill.
                console.warn(`Flag texture failed for ${iso}:`, error);
            }
        }

        return loadedPatternCodes;
    }

    async function loadCountryOverlay(mapInstance, visitedCountries, loadedFlagPatterns) {
        const countriesGeoJson = await fetchCountriesGeoJson();
        if (!countriesGeoJson) {
            return;
        }

        // Normalize iso2 property so we can filter regardless of source property names.
        countriesGeoJson.features.forEach((feature) => {
            const props = feature.properties || {};
            const iso2 =
                props.iso2 ||
                props.iso_a2 ||
                props["ISO3166-1-Alpha-2"] ||
                props.ISO_A2 ||
                props.ISO2 ||
                "";

            feature.properties = {
                ...props,
                iso2: String(iso2).toUpperCase()
            };
        });

        const visitedIsoCodes = visitedCountries.map((country) => country.isoA2.toUpperCase());

        mapInstance.addSource("world-countries", {
            type: "geojson",
            data: countriesGeoJson
        });

        mapInstance.addLayer({
            id: "country-boundaries",
            type: "line",
            source: "world-countries",
            paint: {
                "line-color": "rgba(85, 100, 124, 0.42)",
                "line-width": 0.82
            }
        });

        mapInstance.addLayer({
            id: "country-base-fill",
            type: "fill",
            source: "world-countries",
            paint: {
                "fill-color": "rgba(248, 251, 255, 0.7)",
                "fill-opacity": 0.32
            }
        });

        // Fallback fill for all visited countries (gold).
        mapInstance.addLayer({
            id: "visited-country-fallback-fill",
            type: "fill",
            source: "world-countries",
            filter: ["in", ["get", "iso2"], ["literal", visitedIsoCodes]],
            paint: {
                "fill-color": "#FFD700",
                "fill-opacity": 0.3
            }
        });

        // Apply per-country flag pattern above gold fill when texture exists.
        visitedCountries.forEach((country) => {
            const iso = country.isoA2.toUpperCase();
            if (!loadedFlagPatterns.has(iso)) {
                return;
            }

            mapInstance.addLayer({
                id: `visited-country-flag-${iso.toLowerCase()}`,
                type: "fill",
                source: "world-countries",
                filter: ["==", ["get", "iso2"], iso],
                paint: {
                    "fill-pattern": `flag-${iso}`,
                    "fill-opacity": 0.62
                }
            });
        });
    }

    async function fetchCountriesGeoJson() {
        const sourcesToTry = [
            "data/countries.geojson",
            "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
        ];

        for (const sourceUrl of sourcesToTry) {
            try {
                const response = await fetch(sourceUrl);
                if (!response.ok) {
                    continue;
                }

                const parsedJson = await response.json();
                if (parsedJson?.type === "FeatureCollection") {
                    return parsedJson;
                }
            } catch (error) {
                console.warn(`Could not load country boundaries from ${sourceUrl}`, error);
            }
        }

        console.warn("Country boundaries unavailable. Travel country overlays skipped.");
        return null;
    }

    function createTravelMarkers(mapInstance, locations) {
        const markerEntries = [];

        locations.forEach((location) => {
            const markerElement = document.createElement("button");
            markerElement.type = "button";
            markerElement.className = "travel-pin";
            markerElement.setAttribute("aria-label", `${location.city}, ${location.country}`);

            const thumbWrap = document.createElement("span");
            thumbWrap.className = "travel-pin-thumb-wrap";

            const thumbImage = document.createElement("img");
            thumbImage.src = location.thumbnailPhoto;
            thumbImage.alt = `${location.city} thumbnail photo`;
            thumbImage.loading = "lazy";
            thumbImage.addEventListener("error", () => {
                thumbImage.src = "images/profile-picture.png";
            });
            thumbWrap.appendChild(thumbImage);

            const pinLabel = document.createElement("span");
            pinLabel.className = "travel-pin-label";
            pinLabel.textContent = location.city;

            markerElement.appendChild(thumbWrap);
            markerElement.appendChild(pinLabel);

            markerElement.addEventListener("click", () => {
                const [lat, lng] = location.coordinates;
                mapInstance.flyTo({
                    center: [lng, lat],
                    zoom: Math.max(mapInstance.getZoom(), 3.6),
                    speed: 0.85,
                    curve: 1.2,
                    essential: true
                });
                openTravelDrawer(location);
            });

            const [lat, lng] = location.coordinates;
            const marker = new maplibregl.Marker({
                element: markerElement,
                opacity: 1,
                opacityWhenCovered: 0,
                anchor: "bottom"
            })
                .setLngLat([lng, lat])
                .addTo(mapInstance);

            markerEntries.push({ marker, markerElement });
        });

        // Scale marker thumbnails slightly by zoom level to reduce clutter.
        const applyMarkerScaleFromZoom = () => {
            const zoom = mapInstance.getZoom();
            const normalized = clamp((zoom - 1) / 4.5, 0, 1);
            const scale = 0.72 + normalized * 0.55;
            const showCoveredMarkers = zoom <= 1.85;

            markerEntries.forEach(({ marker, markerElement }) => {
                markerElement.style.transform = `scale(${scale.toFixed(3)})`;
                marker.setOpacity(1, showCoveredMarkers ? 1 : 0);
            });
        };

        mapInstance.on("zoom", applyMarkerScaleFromZoom);
        applyMarkerScaleFromZoom();
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
})();
