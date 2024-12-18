export function distanceBetweenTwoPoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const EARTH_RADIUS = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS * c;
  return distance;
}

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}
