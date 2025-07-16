import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (filePath) => {
    cloudinary.config({
        cloud_name: process.env.Cloudinary_cloud_name,
        api_key: process.env.Cloudinary_api_key,
        api_secret: process.env.Cloudinary_api_secret
    });

    try {
        const uploadResult = await cloudinary.uploader
            .upload(filePath)
            fs.unlinkSync(filePath);
            return uploadResult.secure_url;

    } catch (error) {
        fs.unlinkSync(filePath);
        return res.status(500).json({ message: 'Error uploading file', error });
    }
}

export default uploadOnCloudinary;