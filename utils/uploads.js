const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, cb) {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString(
        'utf8'
      );
      console.log(file);
      cb(null, new Date().toISOString() + '-' + decodeURI(file.originalname));
    },
    // limits: { fileSize: 5 * 1024 * 1024 },
  }),
  acl: 'public-read-write',
});

module.exports = { upload };
