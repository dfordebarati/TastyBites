import ApiError from '../utils/ApiError.js';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

// OpenStreetMap asks apps to identify themselves, so the lookup runs here instead of in the browser
export const reverseGeocode = async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw ApiError.badRequest('Invalid coordinates');
  }

  const url = new URL(NOMINATIM_URL);
  url.search = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lng),
    addressdetails: '1',
    zoom: '18',
  }).toString();

  let data;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TastyBites/1.0 (restaurant ordering demo)', 'Accept-Language': 'en' },
    });
    if (!response.ok) throw new Error(`Lookup failed with status ${response.status}`);
    data = await response.json();
  } catch {
    throw new ApiError(502, 'Could not look up an address for your location right now');
  }

  const a = data.address ?? {};

  res.json({
    success: true,
    label: data.display_name ?? '',
    address: {
      line1: [a.house_number, a.building].filter(Boolean).join(', '),
      line2: [a.road, a.neighbourhood ?? a.suburb ?? a.quarter].filter(Boolean).join(', '),
      landmark: a.amenity ? `Near ${a.amenity}` : '',
      city: a.city ?? a.town ?? a.village ?? a.city_district ?? a.county ?? '',
      state: a.state ?? '',
      pincode: (a.postcode ?? '').replace(/\s/g, ''),
    },
  });
};
