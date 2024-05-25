import { Router } from "express";
import { registerUser,logIn,logOut, refreshAccessToken} from '../controllers/userController.js'
import { upload } from "../middleware/multerMiddleware.js"
import { verifyJWT } from "../middleware/userAuthMiddleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(logIn)

//secure routes
router.route("/logout").post(verifyJWT,logOut)
router.route("/regenarate-access-tokn").post(refreshAccessToken)

export default router