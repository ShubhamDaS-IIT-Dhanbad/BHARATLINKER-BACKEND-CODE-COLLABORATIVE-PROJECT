import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'
const connectDB=async ()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}/theakt`)
        console.log(`MongoDB connected !! ${connectionInstance.connection.host}`)
    }catch(erorr){
        console.log(`connection failed `)
        process.exit(1)
    }
}
export default connectDB