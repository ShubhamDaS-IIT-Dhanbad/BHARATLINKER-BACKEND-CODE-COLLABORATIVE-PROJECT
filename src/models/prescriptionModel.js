const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    imageLink: {
        type: String,
        required: true,
    },
});

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
