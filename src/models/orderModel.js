import mongoose, {Schema} from "mongoose";
const orderSchema = new Schema({
    orderBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'PayPal', 'Cash on Delivery'], // Example payment methods
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    }
},{timestamps: true});
export const Order = mongoose.model("Order", orderSchema)
