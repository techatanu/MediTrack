import mongoose from 'mongoose';
import Report from '../models/Report.js';
import Doctor from '../models/Doctor.js';
import escapeRegex from '../utils/escapeRegex.js';

const DOCTOR_FIELDS = 'name specialization hospital';

const notFound = (res) =>
  res.status(404).json({ error: { message: 'Report not found or unauthorized' } });

// A report may only link to a doctor owned by the same user.
const doctorBelongsToUser = (doctorId, userId) => Doctor.exists({ _id: doctorId, user: userId });
const doctorNotFound = (res) => res.status(400).json({ error: { message: 'Doctor not found' } });

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

export const createReport = async (req, res, next) => {
  try {
    const { title, description, category, reportDate, doctor } = req.valid.body;

    if (doctor && !(await doctorBelongsToUser(doctor, req.user.id))) {
      return doctorNotFound(res);
    }

    const report = await Report.create({
      title,
      description,
      fileUrl: req.file?.path,
      category,
      reportDate,
      user: req.user.id,
      doctor
    });

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
    const report = await Report.findOneAndDelete({ _id: req.valid.params.id, user: req.user.id });

    if (!report) return notFound(res);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};
