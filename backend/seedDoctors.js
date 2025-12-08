import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './src/models/Doctor.js';
import User from './src/models/User.js'; 


dotenv.config();

const seedDoctors = async () => {
    try {

        if (!process.env.MONGO_URI) {
            console.error('Error: MONGO_URI is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');


        const userEmail = "a@gmail.com";
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.error(`Error: User with email ${userEmail} not found.`);
            console.log('Please register this user first via the Signup page.');
            process.exit(1);
        }

        console.log(`Found User: ${user.email} (ID: ${user._id})`);


        await Doctor.deleteMany({ user: user._id });
        console.log('Cleared existing doctors for this user.');


        const dummyDoctors = [
            {
                name: "Dr. Sarah Smith",
                specialization: "Cardiologist",
                hospital: "City Heart Center",
                phone: "555-0101",
                user: user._id
            },
            {
                name: "Dr. James Jones",
                specialization: "Dermatologist",
                hospital: "Skin & Care Clinic",
                phone: "555-0102",
                user: user._id
            },
            {
                name: "Dr. Emily Chen",
                specialization: "Pediatrician",
                hospital: "Children's General",
                phone: "555-0103",
                user: user._id
            },
            {
                name: "Dr. Michael Brown",
                specialization: "Neurologist",
                hospital: "Neuro Institute",
                phone: "555-0104",
                user: user._id
            },
            {
                name: "Dr. Lisa White",
                specialization: "General Physician",
                hospital: "Community Health",
                phone: "555-0105",
                user: user._id
            }
        ];


        await Doctor.insertMany(dummyDoctors);
        console.log('Successfully seeded 5 dummy doctors!');


        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedDoctors();
