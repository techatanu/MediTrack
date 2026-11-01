import multer from 'multer';
import HttpError from '../utils/httpError.js';
import { isAllowedDeclaredType, UNSUPPORTED_FILE_MESSAGE } from '../utils/fileType.js';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Memory storage: the file is only sent to Cloudinary after the body and the file's
// real type have been validated, so rejected requests never leave orphaned uploads.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 10, fieldSize: 20 * 1024 },
  fileFilter: (req, file, cb) => {
    if (isAllowedDeclaredType(file.originalname, file.mimetype)) return cb(null, true);
    cb(new HttpError(400, UNSUPPORTED_FILE_MESSAGE));
  },
});

const MULTER_ERRORS = {
  LIMIT_FILE_SIZE: [413, 'File is too large (max 10 MB)'],
  LIMIT_FILE_COUNT: [400, 'Only one file can be uploaded'],
  LIMIT_UNEXPECTED_FILE: [400, 'Unexpected file field (expected "image")'],
};

export const uploadReportFile = (req, res, next) =>
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const [status, message] = MULTER_ERRORS[err.code] || [400, 'Invalid upload'];
      return next(new HttpError(status, message));
    }
    next(err);
  });
