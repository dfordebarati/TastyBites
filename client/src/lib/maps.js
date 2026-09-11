export const mapEmbedUrl = ({ lat, lng }) => {
  const d = 0.004;
  const bbox = [lng - d, lat - d, lng + d, lat + d].map((n) => n.toFixed(6)).join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
};

export const googleMapsUrl = ({ lat, lng }) => `https://www.google.com/maps?q=${lat},${lng}`;
