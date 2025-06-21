const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const router = express.Router();
const {DB_URI} = require('../config')

const storage = new GridFsStorage({
    url: DB_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return {
            bucketName: 'photos',
            filename: `${Date.now()}-${file.originalname}`
        };
    }
});

const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).send('No file uploaded.');
    }
    console.log('File uploaded:', req.file);
    res.status(201).send('File uploaded successfully');
});

router.get('/', async (req, res) => {
    const conn = mongoose.connection;
    const gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'photos'
    });

    gfs.find().toArray((err, files) => {
        if (err) {
            console.error('Error fetching files:', err);
            return res.status(500).json({ message: 'An error occurred', error: err });
        }
        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'No files available' });
        }
        res.json(files);
    });
});

module.exports = router;
