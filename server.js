require ('dotenv').config();
const connectDB = require('./config/db');
const express = require ('express');
const cors = require ('cors');
const logger = require ('./config/logger')
const apiRouter = require('./routes/api')
const app = express();

const requestLogger = (req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl} from ${req.ip}`);
    next();
};
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', apiRouter);
app.use(requestLogger);
connectDB();

app.listen(process.env.PORT, () => {
  logger.info(`Server running on port ${process.env.PORT}`);
});