import { Router } from "express";
import { 
    createProduct, 
    getAllProducts, 
    getRetailerProducts,
    getProductDetails ,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import { upload } from "../middleware/multerMiddleware.js";
import { retailerVerifyJwt } from "../middleware/retailerAuthMiddleware.js";

const router = Router();

// Secure routes
router.route("/addproduct").post(upload.array('images'), createProduct);
router.route("/updateproduct/:id").post(upload.array('images'),updateProduct);
router.route("/deleteproduct/:id").post(upload.array('images'),deleteProduct);

router.route("/products/").get(getAllProducts);
router.route("/search/products/:keyword").get(getAllProducts);
router.route("/retailer/products/:shopId").get(getRetailerProducts);
router.route("/productsdetail/:id").get(getProductDetails);
router.route("/retailerproducts").get(getRetailerProducts);

export default router;

