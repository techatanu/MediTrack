import Doctor from '../models/Doctor.js';
import HttpError from '../utils/httpError.js';
import definedOnly from '../utils/definedOnly.js';

const notFound = () => new HttpError(404, 'Doctor not found');

export const createDoctor = async (req, res) => {
  const doctor = await Doctor.create({ ...req.valid.body, user: req.user.id });
  res.status(201).json({ data: doctor });
};

export const getDoctors = async (req, res) => {
  const doctors = await Doctor.find({ user: req.user.id });
  res.json({ data: doctors });
};

export const updateDoctor = async (req, res) => {
  const doctor = await Doctor.findOneAndUpdate(
    { _id: req.valid.params.id, user: req.user.id },
    { $set: definedOnly(req.valid.body) },
    { returnDocument: 'after', runValidators: true }
  );
  if (!doctor) throw notFound();

  res.json({ data: doctor });
};

export const deleteDoctor = async (req, res) => {
  const doctor = await Doctor.findOneAndDelete({ _id: req.valid.params.id, user: req.user.id });
  if (!doctor) throw notFound();

  res.status(204).end();
};
