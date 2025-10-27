export interface ExternalLink {
    name: string;
    url: string;
    path: string;
}

export const externalLinks: ExternalLink[] = [
    { 
        name: "RESIZE IMAGE", 
        url: "https://image.pi7.org/reduce-image-size-in-kb", 
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