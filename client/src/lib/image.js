// Cloudinary resizes on the fly when a transformation is placed right after /upload/
export const optimize = (url, transform) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transform},q_auto,f_auto/`);
};
