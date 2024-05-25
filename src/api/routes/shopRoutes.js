import { Router } from "express";
import { getShopDetails,registerShop,getAllShops} from '../controllers/shopController.js';
import { upload } from "../middleware/multerMiddleware.js";

const router = Router()
router.route("/register").post(upload.array('images'),registerShop)
router.route("/shops").get(getAllShops)
router.route("/shopdetail/:id").get(getShopDetails)
export default router