import mongoose, { Schema } from "mongoose";

const shopSchema = new Schema({
    prescription:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
    },
    ratings: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must be at most 5'],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    },
    description: {
        type: String
    },
    shopStatus: {
        type: Boolean
    },
    image: {
        type: [String]
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    shopName: {
        type: String,
        required: true
    },
    category: {
        type: [String],
        required: true
    },
    pinCodes: {
        type: [{
            type: String,
            validate: {
                validator: function (v) {
                    // Regular expression to validate pin codes (assuming Indian format)
                    return /^\d{6}$/.test(v);
                },
                message: props => `${props.value} is not a valid pin code!`
            }
        }],
        validate: {
            validator: function (v) {
                // Ensure there are at most 5 unique pin codes
                return new Set(v).size <= 5;
            },
            message: props => 'A shop can have up to 5 unique pin codes!'
        }
    },
    location: {
        lat: {
            type: String,
            required: true
        },
        lon: {
            type: String,
            required: true
        }
    },
    openingHours: [{
        openTime: {
            type: String
        },
        closeTime: {
            type: String
        }
    }],
    closeDays: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
       
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Retailer'
    }
});

export const Shop = mongoose.model("Shop", shopSchema);
