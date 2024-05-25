import mongoose, {Schema} from "mongoose";
const cartSchema = new Schema({
    cartOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          color: String,
        },
    ]
},{timestamps: true});
export const Cart = mongoose.model("Cart", cartSchema)
