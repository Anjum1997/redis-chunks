const Address = require('../models/address');
const cache = require('../utilitis/cache');

exports.addAddress = async (req, res, next) => {
  const address = new Address({
    user: req.user,
    addressLine: req.body.addressLine,
    city: req.body.city,
    state: req.body.state,
    postalCode: req.body.postalCode,
  });

  try {
    const savedAddress = await address.save();
    await cache.set(`addresses_${req.user._id}`,address);
    res.success({ message: 'user address has been added successfully', address: savedAddress });
    next();
  } catch (err) {
    next(err);
  }
};

exports.getAddresses = async (req, res, next) => {
  try {
    const cachedAddresses = await cache.get(`addresses_${req.user._id}`);
    if (cachedAddresses) {
      res.success({ addresses :JSON.parse(cachedAddresses)});
      return next();
    }

    const addresses = await Address.find({ user: req.user._id });
    await cache.set(`addresses_${req.user._id}`, addresses);
    res.success ({ message: 'user address is present', addresses});
    next();
  } catch (err) {
    next(err);
  }
};

