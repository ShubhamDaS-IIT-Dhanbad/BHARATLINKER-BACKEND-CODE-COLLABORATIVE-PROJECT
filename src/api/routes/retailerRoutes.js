import { Router } from "express";
import { registerShop} from '../controllers/shopController.js';

import { registerRetailer,logInRetailer,logOutRetailer,getRetailerData} from '../controllers/retailerController.js';
// import { upload } from "../middleware/multerMiddleware.js"

import { retailerVerifyJwt } from "../middleware/retailerAuthMiddleware.js";


const router = Router()

router.route("/register").post(registerRetailer)
router.route("/login").post(logInRetailer)

//secure routes
router.route("/retailerdata/:retailerid").get(getRetailerData)
router.route("/add").post( registerShop)
router.route("/logout").post( retailerVerifyJwt,logOutRetailer)

export default router