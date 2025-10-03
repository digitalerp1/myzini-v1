export interface ExternalLink {
    name: string;
    url: string;
    path: string;
}

export const externalLinks: ExternalLink[] = [
    { 
        name: "School Info (Wikipedia)", 
        url: "https://en.wikipedia.org/wiki/School", 
        path: "external/school-info" 
    },
    { 
        name: "Edu Resources (W3C)", 
        url: "https://www.w3.org/WAI/fundamentals/", 
        path: "external/edu-resources" 
    },
    { 
        name: "Digital Library (Archive)", 
        url: "https://archive.org/details/texts", 
        path: "external/digital-library" 
    },
    { 
        name: "World Map (OSM)", 
        url: "https://www.openstreetmap.org/export/embed.html", 
        path: "external/world-map" 
    }
];