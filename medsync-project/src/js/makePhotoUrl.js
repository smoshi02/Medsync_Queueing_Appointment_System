export function makePhotoUrl(photo) {
  if (!photo) return null;

  // Already base64 or already full data URI -> return as is
  if (photo.startsWith("data:image")) return photo;

  // If it's an uploads path, prepend the server URL
  if (photo.startsWith("/uploads/")) {
    return `http://localhost:6969${photo}`;
  }

  return photo;
}
