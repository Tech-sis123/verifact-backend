require('dotenv').config();
const connectDB = require('./config/db');
const multer = require('multer');
const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');
const apiRouter = require('./routes/api');

const app = express();


const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
};


const allowedOrigins = [
  'http://127.0.0.1:8080',
  'https://sadiq-teslim.github.io'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);



const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});


app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  next(err);
});


app.use('/api', apiRouter);

connectDB();


app.listen(process.env.PORT, () => {
  logger.info(`Server running on port ${process.env.PORT}`);
});
