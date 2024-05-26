import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    streetAddress: {
        type: String,
        required: true
    },
    landMark: String,
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{6}$/.test(v); // Validate pin code format (6 digits)
            },
            message: props => `${props.value} is not a valid pin code!`
        }
    },
    country: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v); // Validate phone number format (10 digits)
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    }
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);

export { Address };
