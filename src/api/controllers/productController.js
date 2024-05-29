import { Product } from "../../models/productModel.js";
import { Retailer } from '../../models/retailerModel.js';
import { Shop } from '../../models/shopModel.js';

import { ApiError } from '../../utils/apiError.js'
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

import fs from "fs";
import cloudinary from 'cloudinary';
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);


// Create Product -- Retailer
const createProduct = asyncHandler(async (req, res, next) => {
  const images = [];
  for (const file of req.files) {
    const avatarLocalPath = file.path;
    const imageUrl = await uploadOnCloudinary(avatarLocalPath);
    images.push(imageUrl.url);
  }
  req.body.images = images;
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product
  });
});

// Get All Product
const getAllProducts = asyncHandler(async (req, res, next) => {
  const resultPerPage = 90;
  const currentPage = Number(req.query.page) || 1;

  const productsCount = await Product.countDocuments();
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .filterByPincode()
    .pagination(resultPerPage)
    .filterByCategoryProducts()
    .filterByShop();

  const products = await apiFeature.query;
  const filteredProductsCount = await Product.countDocuments(apiFeature.query); // Adjust if necessary
  const totalPages = Math.ceil(filteredProductsCount / resultPerPage);

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
    totalPages,
    currentPage,
  });
});


// Get All Product retailer
const getRetailerProducts = asyncHandler(async (req, res, next) => {
  const { shopId } = req.params;console.log(shopId)
  try {
    const products = await Product.find({ shop:shopId });
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
});

// Get Product Details
const getProductDetails = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  try {
    product.title = req.body.title || product.title;
    product.price = req.body.price !== undefined ? req.body.price : product.price;
    product.discountedPrice = req.body.discountedPrice !== undefined ? req.body.discountedPrice : product.discountedPrice;
    product.description = req.body.description || product.description;
    product.featured = req.body.featuredproduct || product.featured;

    product.keyWords = req.body.keywords ? [...req.body.keywords] : product.keyWords;
    product.category = req.body.category ? [...req.body.category] : product.category;
    product.brand = req.body.brand || product.brand;

    if (req.files) {
      const images = [];
      for (const file of req.files) {
        const avatarLocalPath = file.path;
        const imageUrl = await uploadOnCloudinary(avatarLocalPath);
        images.push(imageUrl.url);
      }
      product.images = [...product.images, ...images].slice(0, 5);
    }

    await product.save();
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
});

/// Function to extract the public ID from a Cloudinary URL
function extractPublicId(url) {
  const urlArray = url.split('/');
  const publicId = urlArray[urlArray.length - 1].split('.')[0];
  return publicId;
}

// Function to delete an image from Cloudinary by its public ID
async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted successfully:", result);
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

// Delete Product
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  try {
    for (const image of product.images) {
      const publicId = extractPublicId(image);
      await deleteImage(publicId);
    }

    // Remove the product from the database
    await Product.findOneAndDelete({ _id: req.params.id });
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return next(new ApiError("Failed to delete product", 500));
  }
});




// Create New Review or Update the review
const createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});



// Get All Reviews of a product
const getProductReviews = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});



// Delete Review
const deleteReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});



export {
  createProduct,
  getAllProducts,
  getRetailerProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
}