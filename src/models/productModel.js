import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    // required: true,
  },
  title: {
    type: String,
    // required: true
  },
  description: {
    type: String,
    // required: true
  },
  keyWords: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    // required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    // required: true,
    min: 0
  },
  quantityAvailable: {
    type: Number,
    // required: true,
    min: 0
  },
  images: {
    type: [String],
    // required: true,
  },
  genderTarget: {
    type: String,
    enum: ['M', 'F', 'any'],
    default: 'any'
  },
  category: {
    type: [String],
    // required: true
  },
  featuredProduct: {
    type: Boolean
  },
  brand: {
    type: String,
    // required: true,
  },
  pinCodes: {
    type: [String],
    validate: {
      validator: function (v) {
        return new Set(v).size <= 5;
      },
      message: props => 'A shop can have up to 5 unique pin codes!'
    }
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });
export const Product = mongoose.model("Product", productSchema);


