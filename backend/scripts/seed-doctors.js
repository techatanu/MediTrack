// Development helper: replaces a user's doctors with five sample doctors.
//   npm run seed:doctors -- <email>
// The user must already exist (sign up through the app first).
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import Doctor from '../src/models/Doctor.js';
import User from '../src/models/User.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
    console.error('Usage: npm run seed:doctors -- <email>');
    process.exit(1);
}

// Deletes the user's existing doctors, so never run it against production data.
if (env.NODE_ENV === 'production') {
    console.error('Refusing to seed: NODE_ENV is production.');
    process.exit(1);
}

const sampleDoctors = [
    { name: 'Dr. Sarah Smith', specialization: 'Cardiologist', hospital: 'City Heart Center', phone: '555-0101' },
    { name: 'Dr. James Jones', specialization: 'Dermatologist', hospital: 'Skin & Care Clinic', phone: '555-0102' },
    { name: 'Dr. Emily Chen', specialization: 'Pediatrician', hospital: "Children's General", phone: '555-0103' },
    { name: 'Dr. Michael Brown', specialization: 'Neurologist', hospital: 'Neuro Institute', phone: '555-0104' },
    { name: 'Dr. Lisa White', specialization: 'General Physician', hospital: 'Community Health', phone: '555-0105' }
];

try {
    await mongoose.connect(env.MONGO_URI);

    const user = await User.findOne({ email });
    if (!user) {
        console.error('No user with that email. Sign up through the app first.');
        process.exitCode = 1;
    } else {
        await Doctor.deleteMany({ user: user._id });
        await Doctor.insertMany(sampleDoctors.map((doctor) => ({ ...doctor, user: user._id })));
        console.log(`Seeded ${sampleDoctors.length} doctors for user ${user._id}.`);
    }
} catch (error) {
    console.error(`Seeding failed: ${error.name}`);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
