
const successHandler = (req, res, next) => {
  res.success = (data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
       success: true, 
       message,
        data
       });
  };
  next();
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
      message: err.message,
      stack: err.stack || [],
    });
  };
  
  module.exports = { errorHandler, successHandler };
  