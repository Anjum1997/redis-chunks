require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const limiter = require('./middleware/rateLimiter');
const userRoute = require('./routes/userRoute');
const addressRoute = require('./routes/addressRoute');
const { successHandler, errorHandler } = require('./utilitis/errorHandler');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const status = require('express-status-monitor');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 7000;

connectDB();
app.use(cors());
app.use(status());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(limiter);
app.use(helmet());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use(successHandler);

app.use(express.static(path.join(__dirname, './public')));
app.use('/api', uploadRoutes);
app.use('/api/auth', userRoute);
app.use('/api/addresses', addressRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
