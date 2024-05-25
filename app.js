// EXPRESS
import  express  from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
  origin:"*",
  credential:true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from './src/api/routes/userRoutes.js'
import retailerRouter from './src/api/routes/retailerRoutes.js'
import productRouter from './src/api/routes/productRoutes.js'
import shopRouter from './src/api/routes/shopRoutes.js'


app.use("/api/v1/account", userRouter)

app.use("/api/v1/retailer", retailerRouter)
app.use("/api/v1/shop", shopRouter)
app.use("/api/v1/product", productRouter)
export {app}