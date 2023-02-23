const multer = require("multer");

const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/bmp": "bmp",
    "image/webp": "webp"
};

try{
    const fileFilter = (req, file, callback) => {
        const extension = MIME_TYPES[file.mimetype];
        if(Object.values(MIME_TYPES).includes(extension)) {
            callback(null, true)
        } else {
            callback(null, false);
            throw new Error("Only .jpg, .jpeg, .png, .bpm, or .webp files allowed.");
        } 
    };
    
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, "images");
        },
        filename: (req, file, callback) => {
            const nameUnderscored = file.originalname.split(" ").join("_");
            const name = nameUnderscored.split(".").join("_");
            const extension = MIME_TYPES[file.mimetype];
            callback(null, name + Date.now() + "." + extension);
        }
    });
    
    module.exports = multer({storage, fileFilter}).single("image");
}
catch(error) {
    console.log(error.message);
}