import cloudinary from '../config/cloudinary.js';

export const saveImage = (file) => {
  if (!file) return Promise.resolve({ url: '', publicId: '' });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'tastybites/menu-items', resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
};

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId).catch(() => {});
};
