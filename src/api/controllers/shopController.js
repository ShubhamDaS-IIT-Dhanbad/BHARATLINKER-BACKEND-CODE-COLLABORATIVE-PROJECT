import { ApiResponse } from '../../utils/apiResponse.js'
import { Shop } from "../../models/shopModel.js";
import { Retailer } from "../../models/retailerModel.js";


import { ApiError } from '../../utils/apiError.js'
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

//add shop modifiued by chargpt
const registerShop = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { phoneNumber, shopName, category, location } = req.body;
  if (!phoneNumber || !shopName || !category) {
    return res.status(400).json(new ApiResponse(400, "Missing required fields: phoneNumber, shopName, category, location, closeDays"));
  }
  if (!location.lat || !location.lon) {
    return res.status(400).json(new ApiResponse(400, "Location must include both lat and lon"));
  }

  try {
    let images = [];
    const files = req.files;
    for (const file of files) {
      const imageUrl = await uploadOnCloudinary(file.buffer, file.originalname);
      images.push(imageUrl.url);
  }
    const createdShop = await Shop.create({ ...req.body, images });
   
    return res.status(201).json(new ApiResponse(201, "Shop registered successfully", createdShop));
  } catch (error) {
    console.error("Error creating shop:", error);
    return res.status(500).json(new ApiResponse(500, "Internal server error"));
  }
});
//add image
const addShopImage = asyncHandler(async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return next(new ApiError("Shop not found", 404));
    }
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        images.push(result.url);
      }
    }
    shop.image = images;
    await shop.save();
    return res.status(200).json(new ApiResponse(200, "Shop images updated successfully", shop));
  } catch (error) {
    console.error("Error updating shop images:", error);
    return res.status(500).json(new ApiResponse(500, "Internal server error"));
  }
});
//get shop detail by id
const getShopDetails = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    return next(new ApiError("Shop not found", 404));
  }
  res.status(200).json({
    success: true,
    shop,
  });
});

const getAllShops = asyncHandler(async (req, res, next) => {
  try {
    const resultPerPage = 8; // Number of results per page
    const shopCount = await Shop.countDocuments(); // Total count of shops

    // Create an instance of ApiFeatures with filtering and pagination methods
    const apiFeature = new ApiFeatures(Shop.find(), req.query)
      .searchShop()

    // Execute the query
    const shops = await apiFeature.query;
    const filteredShopsCount = shops.length; // Number of shops after filtering

    // Send the response
    res.status(200).json({
      success: true,
      shops,
      shopCount,
      resultPerPage,
      filteredShopsCount,
    });
  } catch (error) {
    next(error); // Pass error to the error-handling middleware
  }
});

export {
  getShopDetails,
  registerShop,
  getAllShops,
  addShopImage
}
