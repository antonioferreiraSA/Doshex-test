const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const secret = 'secretkey';

router.post('/login', async (req, res) => {
  console.log(
    'hey body --------------------------------------------\n',
    req.body,
  );
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res
        .status(400)
        .send({ message: 'Incorrect username or password.' });
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    console.log(
      'isPasswordMatch --------------------------------------------\n',
      isPasswordMatch,
    );

    if (!isPasswordMatch) {
      return res
        .status(400)
        .send({ message: 'Incorrect username or password.' });
    }

    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: '7h',
    });
    console.log('token --------------------------------------------\n', token);

    res.send({ token });
  } catch (error) {
    console.log(
      'errorrrrrr --------------------------------------------\n',
      error,
    );

    res.status(500).send(error);
  }
});

router.post('/sign-up', async (req, res) => {
  console.log(
    'signup --------------------------------------------\n',
    req.body,
  );
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).send({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: '1h',
    });
    res.send({ token });
  } catch (error) {
    console.log(
      'errorrrrrr --------------------------------------------\n',
      error,
    );
    res.status(500).send(error);
  }
});

module.exports = router;
