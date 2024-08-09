const User = require('../models/user');
const jwt = require('../utilitis/jwt');
const { registerValidation, loginValidation } = require('../utilitis/Validation');
const cache = require('../utilitis/cache');

exports.register = async (req, res,next) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send('Email already exists');

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role || 'user',
  });

  try {
    const savedUser = await user.save();
    res.success({ message: 'user registered successfully', user: savedUser });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res,next) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Email or password is wrong');

  const validPass = await user.matchPassword(req.body.password);
  if (!validPass) return res.status(400).send('Invalid password');

  const token = jwt.signToken(user);
  try {
    await cache.set(`user_${user._id}`, user); 
    return res.success({ message: 'user logged in successfully', user,token  });
  } catch (err) {
    next(err);
  }
};


exports.getUserById = async (req, res,next) => {
  const userId = req.params.id;

  try {
    const cachedUser = await cache.get(`user:${userId}`);
    if (cachedUser) {
      return res.success({ user: JSON.parse(cachedUser) });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');
    await cache.set(`user:${userId}`, user);

    res.success({ user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUserById = async (req, res,next) => {
  const userId = req.params.id;

  try {
    await User.findByIdAndDelete(userId);
    await cache.del(`user:${userId}`);
    res.success({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};


exports.getAllUsersWithAddresses = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    const cachedUsers = await cache.get('all_users_with_addresses');
    if (cachedUsers) {
      return res.success({ users: JSON.parse(cachedUsers) });
    }

    const users = await User.find().populate('addresses').exec();
    await cache.set('all_users_with_addresses', JSON.stringify(users));

    res.success({ message: 'Admin user has access to all users with their addresses', users });
  } catch (err) {
    next(err);
  }
};
