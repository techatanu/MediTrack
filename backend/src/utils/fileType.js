// Allowed report file types, identified by their leading "magic" bytes rather than
// the client-supplied name or MIME type, which are trivially spoofed.
export const FILE_TYPES = [
  {
    format: 'pdf',
    mimeType: 'application/pdf',
    extensions: ['pdf'],
    matches: (b) => b.toString('latin1', 0, 5) === '%PDF-',
  },
  {
    format: 'jpg',
    mimeType: 'image/jpeg',
    extensions: ['jpg', 'jpeg'],
    matches: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    format: 'png',
    mimeType: 'image/png',
    extensions: ['png'],
    matches: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    format: 'webp',
    mimeType: 'image/webp',
    extensions: ['webp'],
    matches: (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP',
  },
];

export const UNSUPPORTED_FILE_MESSAGE = 'Only PDF, JPG, PNG or WEBP files are allowed';

// Cheap pre-check on the declared name and MIME type, before the body is buffered.
export const isAllowedDeclaredType = (filename, mimeType) => {
  const ext = filename.split('.').pop().toLowerCase();
  return FILE_TYPES.some((t) => t.extensions.includes(ext) && t.mimeType === mimeType);
};

// Returns { format, mimeType } for an allowed file, or null.
export const detectFileType = (buffer) => {
  const type = FILE_TYPES.find((t) => t.matches(buffer));
  return type ? { format: type.format, mimeType: type.mimeType } : null;
};

export const mimeTypeForFormat = (format) =>
  FILE_TYPES.find((t) => t.extensions.includes(String(format).toLowerCase()))?.mimeType;
