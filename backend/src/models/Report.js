import mongoose from 'mongoose';

// Private Cloudinary asset backing the report; see services/fileStorage.js.
const storedFileSchema = new mongoose.Schema({
    publicId: { type: String, required: true },
    resourceType: { type: String, required: true },
    deliveryType: { type: String, required: true },
    format: String,
    mimeType: String,
    bytes: Number
}, { _id: false });

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        enum: ['Lab', 'Prescription'],
        required: true
    },
    reportDate: {
        type: Date,
        required: true
    },
    file: {
        type: storedFileSchema,
        default: undefined
    },
    // Legacy: public URL of files uploaded before storage was made private.
    // Run scripts/make-uploads-private.js to migrate these.
    fileUrl: {
        type: String
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: {
        // Clients get the file's type and size; storage identifiers stay server-side.
        transform: (doc, ret) => {
            if (ret.file) ret.file = { mimeType: ret.file.mimeType, format: ret.file.format, bytes: ret.file.bytes };
            return ret;
        }
    }
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
