import { mimeTypeForFormat } from './fileType.js';

// Reports uploaded before files were made private store a public Cloudinary URL like
//   https://res.cloudinary.com/<cloud>/image/upload/v1700000000/meditrack_reports/abc123.pdf
// This recovers the stored-file descriptor from it, or null if it isn't one.
export const parseLegacyFileUrl = (url) => {
  const match = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(image|raw|video)\/upload\/(?:v\d+\/)?(.+)$/.exec(
    url || ''
  );
  if (!match) return null;

  const [, resourceType, path] = match;
  const dot = path.lastIndexOf('.');
  const format = dot > path.lastIndexOf('/') ? path.slice(dot + 1) : undefined;
  // For raw files Cloudinary keeps the extension as part of the public id.
  const publicId = resourceType === 'raw' || !format ? path : path.slice(0, dot);

  return {
    publicId,
    resourceType,
    deliveryType: 'upload',
    format,
    mimeType: mimeTypeForFormat(format),
  };
};
