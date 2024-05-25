import mongoose, {Schema} from "mongoose";
const addressSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    streetAddress: {
        type: String,
        required: true
    },
    landMark:{
        type: String
    },
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
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    }
},{timestamps: true});
export const Address = mongoose.model("Address", addressSchema)
