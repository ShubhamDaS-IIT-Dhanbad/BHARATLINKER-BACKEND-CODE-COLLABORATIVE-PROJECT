import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: 'dicsxehfn', 
  api_key: '814615997439473', 
  api_secret: 'vr7pNzNjZ9-kx4pMt2UZuv1jmEE' 
});
console.log("cloudinary")
const uploadOnCloudinary = async (localFilePath) => {
    try {console.log("cloudinary link")
        if (!localFilePath) return null
     
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("cloudinary link")
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {console.log("cloudinary unlink")
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export {uploadOnCloudinary}