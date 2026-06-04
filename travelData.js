/*
 * Single source of truth for travel map content.
 *
 * Coordinate format in this file is [lat, lng] to keep data entry intuitive.
 * The map rendering code converts to [lng, lat] internally for MapLibre.
 */
const travelData = {
    visitedCountries: [
        {
            isoA2: "MX",
            country: "Mexico",
            flagTexture: "assets/travel/flags/mx.png"
        },
        {
            isoA2: "BZ",
            country: "Belize",
            flagTexture: "assets/travel/flags/bz.png"
        },
        {
            isoA2: "KR",
            country: "South Korea",
            flagTexture: "assets/travel/flags/kr.png"
        },
        {
            isoA2: "JP",
            country: "Japan",
            flagTexture: "assets/travel/flags/jp.png"
        },
        {
            isoA2: "VN",
            country: "Vietnam",
            flagTexture: "assets/travel/flags/vn.png"
        },
        {
            isoA2: "US",
            country: "United States",
            flagTexture: "assets/travel/flags/us.png"
        }
    ],
    locations: [
        {
            id: "cancun",
            city: "Cancun",
            country: "Mexico",
            coordinates: [21.1619, -86.8515],
            thumbnailPhoto: "images 1/Cancun 1.jpeg",
            tripPhotos: [
                "images 1/Cancun 1.jpeg",
                "images 1/Cancun 2.jpeg"
            ]
        },
        {
            id: "belize-city",
            city: "Belize City",
            country: "Belize",
            coordinates: [17.251, -88.759],
            thumbnailPhoto: "images 1/Belize 1.jpg",
            tripPhotos: [
                "images 1/Belize 1.jpg",
                "images 1/Belize 2.jpg"
            ]
        },
        {
            id: "seoul",
            city: "Seoul",
            country: "South Korea",
            coordinates: [37.5665, 126.978],
            thumbnailPhoto: "images two/Seoul 1.jpeg",
            tripPhotos: [
                "images two/Seoul 1.jpeg",
                "images 1/Seoul 2.jpeg",
                "images two/Seoul 3.jpeg"
            ]
        },
        {
            id: "tokyo",
            city: "Tokyo",
            country: "Japan",
            coordinates: [35.6762, 139.6503],
            thumbnailPhoto: "images 1/Tokyo 1.jpeg",
            tripPhotos: [
                "images 1/Tokyo 1.jpeg",
                "images two/Tokyo 2.jpeg"
            ]
        },
        {
            id: "kyoto",
            city: "Kyoto",
            country: "Japan",
            coordinates: [35.0116, 135.7681],
            thumbnailPhoto: "images two/Kyoto 1.jpeg",
            tripPhotos: [
                "images two/Kyoto 1.jpeg",
                "images two/Kyoto 2.jpeg"
            ]
        },
        {
            id: "tam-coc",
            city: "Tam Coc",
            country: "Vietnam",
            coordinates: [20.2281, 105.9438],
            thumbnailPhoto: "images 1/Tam coc 1.jpeg",
            tripPhotos: [
                "images 1/Tam coc 1.jpeg",
                "images two/Tam coc 2.jpeg"
            ]
        },
        {
            id: "ho-chi-minh-city",
            city: "Ho Chi Minh City",
            country: "Vietnam",
            coordinates: [10.8231, 106.6297],
            thumbnailPhoto: "images two/Ho Chi Minh.jpeg",
            tripPhotos: [
                "images two/Ho Chi Minh.jpeg"
            ]
        },
        {
            id: "wrangell",
            city: "Wrangell, Alaska",
            country: "United States",
            coordinates: [56.4716, -132.3768],
            thumbnailPhoto: "images 1/Wrangell Ak 1.jpeg",
            tripPhotos: [
                "images 1/Wrangell Ak 1.jpeg",
                "images 1/Wrangell Ak 2.jpeg"
            ]
        }
    ]
};

// Expose data globally for the map initializer.
window.travelData = travelData;
