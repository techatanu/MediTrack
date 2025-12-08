import Doctor from '../models/Doctor.js';

// Create a new doctor
export const createDoctor = async (req, res, next) => {
    try {
        const { name, specialization, hospital, phone } = req.body;

        // Check if doctor already exists for this user (optional, but good practice)
        // const existingDoctor = await Doctor.findOne({ name, user: req.user.id });
        // if (existingDoctor) {
        //   return res.status(400).json({ error: { message: 'Doctor already exists' } });
        // }

        const doctor = await Doctor.create({
            name,
            specialization,
            hospital,
            phone,
            user: req.user.id
        });

        res.status(201).json({ data: doctor });
    } catch (error) {
        next(error);
    }
};

// Get all doctors for the logged-in user
export const getDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.find({ user: req.user.id });
        res.json({ data: doctors });
    } catch (error) {
        next(error);
    }
};

// Update a doctor
export const updateDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, specialization, hospital, phone } = req.body;

        const doctor = await Doctor.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { name, specialization, hospital, phone },
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({ error: { message: 'Doctor not found or unauthorized' } });
        }

        res.json({ data: doctor });
    } catch (error) {
        next(error);
    }
};

// Delete a doctor
export const deleteDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findOneAndDelete({ _id: id, user: req.user.id });

        if (!doctor) {
            return res.status(404).json({ error: { message: 'Doctor not found or unauthorized' } });
        }

        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        next(error);
    }
};
