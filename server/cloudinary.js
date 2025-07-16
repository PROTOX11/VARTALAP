const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'vartalap-wow',
        resource_type: 'auto',

        format: async (req, file) => {
            // Determine format based on mimetype
            if (file.mimetype.startsWith('image/')) {
                return 'png';
            } else if (file.mimetype.startsWith('video/')) {
                return 'mp4';
            }
            return 'png'; // default fallback
        },
        public_id: (req, file) => {
            const originalName = file.originalname.split('.').slice(0, -1).join('.');
            return `${originalName}-${Date.now()}`;
        },

    },
});

const upload = multer({ storage: storage });

module.exports = upload;
