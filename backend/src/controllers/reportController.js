import mongoose from 'mongoose';
import Report from '../models/Report.js';
import Doctor from '../models/Doctor.js';
import escapeRegex from '../utils/escapeRegex.js';
import { detectFileType, mimeTypeForFormat, UNSUPPORTED_FILE_MESSAGE } from '../utils/fileType.js';
import { parseLegacyFileUrl } from '../utils/legacyFileUrl.js';
import { uploadFile, deleteFile, getSignedUrl, logStorageError } from '../services/fileStorage.js';

const DOCTOR_FIELDS = 'name specialization hospital';

const notFound = (res) =>
  res.status(404).json({ error: { message: 'Report not found or unauthorized' } });

// A report may only link to a doctor owned by the same user.
const doctorBelongsToUser = (doctorId, userId) => Doctor.exists({ _id: doctorId, user: userId });
const doctorNotFound = (res) => res.status(400).json({ error: { message: 'Doctor not found' } });

const storageUnavailable = (res, action) =>
  res.status(502).json({ error: { message: `Could not ${action} the file. Please try again.` } });

const definedOnly = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));


export const getReports = async (req, res, next) => {
  try {
    const { category, doctor, search, sort, page, limit } = req.valid.query;

    const query = { user: req.user.id };
    if (category) query.category = category;
    if (doctor) query.doctor = doctor;
    if (search) {
      // trusted(): sanitizeFilter would otherwise neutralise this operator.
      query.title = mongoose.trusted({ $regex: escapeRegex(search), $options: 'i' });
    }

    const sortField = sort.replace(/^-/, '');
    // _id tie-breaker keeps pagination stable when sort values are equal.
    const sortOptions = { [sortField]: sort.startsWith('-') ? -1 : 1, _id: -1 };

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('doctor', DOCTOR_FIELDS)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit),
      Report.countDocuments(query)
    ]);

    res.json({
      data: reports,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.valid.params.id, user: req.user.id })
      .populate('doctor', DOCTOR_FIELDS);

    if (!report) return notFound(res);

    res.json({ data: report });
  } catch (error) {
    next(error);
  }
};

// Returns a short-lived signed link to the report's file, after checking ownership.
export const getReportFile = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.valid.params.id, user: req.user.id })
      .select('file fileUrl');

    if (!report) return notFound(res);

    if (report.file) {
      const { url, expiresAt } = getSignedUrl(report.file);
      return res.json({ data: { url, expiresAt, mimeType: report.file.mimeType } });
    }
    if (report.fileUrl) {
      // Legacy public upload: the URL is already public, so there's nothing to sign.
      const mimeType = parseLegacyFileUrl(report.fileUrl)?.mimeType
        ?? mimeTypeForFormat(report.fileUrl.split('.').pop());
      return res.json({ data: { url: report.fileUrl, expiresAt: null, mimeType } });
    }

    res.status(404).json({ error: { message: 'This report has no file' } });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
  try {
    const { title, description, category, reportDate, doctor } = req.valid.body;

    const fileType = req.file && detectFileType(req.file.buffer);
    if (req.file && !fileType) {
      return res.status(400).json({ error: { message: UNSUPPORTED_FILE_MESSAGE } });
    }

    if (doctor && !(await doctorBelongsToUser(doctor, req.user.id))) {
      return doctorNotFound(res);
    }

    // Upload only after every check has passed.
    let file;
    if (req.file) {
      try {
        file = await uploadFile(req.file.buffer, fileType);
      } catch (err) {
        logStorageError('upload', err);
        return storageUnavailable(res, 'store');
      }
    }

    let report;
    try {
      report = await Report.create({
        title,
        description,
        file,
        category,
        reportDate,
        user: req.user.id,
        doctor
      });
    } catch (err) {
      if (file) await deleteFile(file).catch((cleanupErr) => logStorageError('cleanup', cleanupErr));
      throw err;
    }

    await report.populate('doctor', DOCTOR_FIELDS);

    res.status(201).json({ data: report });
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const updates = definedOnly(req.valid.body);

    if (updates.doctor && !(await doctorBelongsToUser(updates.doctor, req.user.id))) {
      return doctorNotFound(res);
    }

    const report = await Report.findOneAndUpdate(
      { _id: req.valid.params.id, user: req.user.id },
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    ).populate('doctor', DOCTOR_FIELDS);

    if (!report) return notFound(res);

    res.json({ data: report });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.valid.params.id, user: req.user.id });

    if (!report) return notFound(res);

    // Delete the file first: if storage fails the report is kept, so the user can retry
    // instead of leaving an orphaned health document behind.
    const storedFile = report.file || parseLegacyFileUrl(report.fileUrl);
    if (storedFile) {
      try {
        await deleteFile(storedFile);
      } catch (err) {
        logStorageError('delete', err);
        return storageUnavailable(res, 'delete');
      }
    }

    await report.deleteOne();

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};
