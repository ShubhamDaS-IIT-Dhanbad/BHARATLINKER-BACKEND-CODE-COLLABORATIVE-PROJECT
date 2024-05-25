import { ApiResponse } from '../../utils/apiResponse.js'
import { Shop } from "../../models/shopModel.js";
import { Retailer } from "../../models/retailerModel.js";

import { ApiError } from '../../utils/apiError.js'
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";

//add shop modifiued by chargpt
const registerShop = asyncHandler(async (req, res) => {
  console.log(req.body)
  const { phoneNumber, shopName, category, location} = req.body;
  if (!phoneNumber || !shopName || !category || !location) {
    return res.status(400).json(new ApiResponse(400, "Missing required fields: phoneNumber, shopName, category, location, closeDays"));
  }
  if (!location.lat || !location.lon) {
    return res.status(400).json(new ApiResponse(400, "Location must include both lat and lon"));
  }

  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        images.push(result.url);
      }
    }

    const createdShop = await Shop.create({ ...req.body, images });

    // const retailer = await Retailer.findById(req.cookies.retailer._id);
    // if (!retailer) {
    //   await Shop.findByIdAndDelete(createdShop._id);
    //   return res.status(404).json(new ApiResponse(404, "Retailer not found"));
    // }

    // retailer.shop = createdShop._id;
    // await retailer.save();

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

// Get All shops
const getAllShops = asyncHandler(async (req, res, next) => {
  const resultPerPage = 8;
  const shopCount = await Shop.countDocuments();
  const apiFeature = new ApiFeatures(Shop.find(), req.query)
  .search()
  .filter()
  .filterByCategoryShop()
  .filterByPincode()
  .pagination(20);


  const shops = await apiFeature.query;
  const filteredShopsCount = shops.length;
  res.status(200).json({
    success: true,
    shops,
    shopCount,
    resultPerPage,
    filteredShopsCount,
  });
});

export {
  getShopDetails,
  registerShop,
  getAllShops,
  addShopImage
}
