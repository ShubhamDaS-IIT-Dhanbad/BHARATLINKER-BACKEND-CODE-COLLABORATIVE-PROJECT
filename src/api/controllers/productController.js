import { Product } from "../../models/productModel.js";

import { ApiError } from '../../utils/apiError.js'
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

import fs from "fs";
import cloudinary from 'cloudinary';
import { promisify } from "util";

// Create Product -- Retailer
const createProduct = asyncHandler(async (req, res, next) => {
  const images = [];
  const files = req.files;
  
  for (const file of files) {
      const imageUrl = await uploadOnCloudinary(file.buffer, file.originalname);
      images.push(imageUrl.url);
  }
  
  req.body.images = images;
  
  const product = await Product.create(req.body);
  res.status(201).json({
      success: true,
      product
  });
});




const getAllProducts = asyncHandler(async (req, res, next) => {
  try {
    const resultPerPage = 90;
    const currentPage = Number(req.query.page) || 1;
console.log(req.query)
    // Initialize ApiFeatures with the query and request query parameters
    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search() // Apply keyword search
      .filter() // Apply other filters
      .filterByPincode() // Filter products by pincode
      .filterByCategoryProducts() // Filter by categories
      .filterByShop() // Filter by shop
      .filterByBrand() // Filter by brand
      .pagination(resultPerPage); // Apply pagination

    // Get the filtered products
    const products = await apiFeature.query;

    // Count the filtered products
    const filteredProductsCount = await Product.countDocuments(apiFeature.query.getFilter());

    // Get the total number of products (before filters)
    const totalProductsCount = await Product.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(filteredProductsCount / resultPerPage);

    // Send the response
    res.status(200).json({
      success: true,
      products,
      productsCount: totalProductsCount, // Total products before filters
      resultPerPage,
      filteredProductsCount,
      totalPages,
      currentPage,
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



const getRetailerProducts = asyncHandler(async (req, res, next) => {
  const { shopId, page = 1, limit = 5 } = req.query;

  if (!shopId) {
    return res.status(400).json({
      success: false,
      message: "Shop ID is required",
    });
  }

  // Correctly parse page and limit with a radix of 10
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber; // Calculate how many records to skip

  try {
    // Fetch products for the shop with pagination
    const products = await Product.find({ shop: shopId })
      .skip(skip) // Skip the first (page - 1) * limit products
      .limit(limitNumber); // Limit the result to the number specified in the limit
    
    // Get the total count of products for the shop (for frontend to know how many pages there are)
    const totalProducts = await Product.countDocuments({ shop: shopId });

    res.status(200).json({
      success: true,
      products,
      totalProducts,
      page: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber), // Calculate total pages
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
  deleteReview
}