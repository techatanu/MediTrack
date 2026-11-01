import cloudinary from '../config/cloudinary.js';

const FOLDER = 'meditrack_reports';
// 'authenticated' assets are not reachable by their plain URL; access needs a signed URL.
const PRIVATE_TYPE = 'authenticated';
export const SIGNED_URL_TTL_SECONDS = 5 * 60;

// Stored-file descriptor (saved on Report.file):
//   { publicId, resourceType, deliveryType, format, mimeType, bytes }

export const uploadFile = (buffer, { format, mimeType }) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: FOLDER, type: PRIVATE_TYPE, resource_type: 'image' }, (err, result) => {
        if (err) return reject(err);
        resolve({
          publicId: result.public_id,
          resourceType: result.resource_type,
          deliveryType: result.type,
          format: result.format || format,
          mimeType,
          bytes: result.bytes,
        });
      })
      .end(buffer);
  });

// A time-limited, signed link through Cloudinary's download API.
export const getSignedUrl = (file) => {
  const expiresAt = Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS;
  const url = cloudinary.utils.private_download_url(file.publicId, file.format, {
    resource_type: file.resourceType,
    type: file.deliveryType,
    expires_at: expiresAt,
  });
  return { url, expiresAt: new Date(expiresAt * 1000) };
};

export const deleteFile = async (file) => {
  const { result } = await cloudinary.uploader.destroy(file.publicId, {
    resource_type: file.resourceType,
    type: file.deliveryType,
    invalidate: true,
  });
  if (result !== 'ok' && result !== 'not found') {
    throw new Error(`Cloudinary destroy returned "${result}"`);
  }
};

// Moves a legacy public upload to private storage in place (same public id).
export const makeFilePrivate = async (file) => {
  const result = await cloudinary.uploader.rename(file.publicId, file.publicId, {
    resource_type: file.resourceType,
    type: file.deliveryType,
    to_type: PRIVATE_TYPE,
    invalidate: true,
  });
  return { ...file, deliveryType: result.type, bytes: result.bytes };
};

// Logs only the operation and error class — Cloudinary errors can echo request details.
export const logStorageError = (operation, err) => {
  console.error(`[storage] ${operation} failed: ${err?.name || 'Error'}${err?.http_code ? ` (${err.http_code})` : ''}`);
};
