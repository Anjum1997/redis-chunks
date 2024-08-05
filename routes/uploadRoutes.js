const express = require('express');
const multer = require('multer');
const uploadController = require('../controller/uploadController');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  }
});
const upload = multer({ storage });

router.post('/upload', upload.single('chunk'), uploadController.uploadChunk);

module.exports = router;
