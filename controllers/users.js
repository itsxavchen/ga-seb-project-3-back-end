// const express = require('express');
// const router = express.Router();

// const User = require('../models/user');

// const verifyToken = require('../middleware/verify-token');

// router.get('/', verifyToken, async (req, res) => {
//   try {
//     const users = await User.find({}, "username");

//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ err: err.message });
//   }
// });

// router.get('/:userId', verifyToken, async (req, res) => {
//   try {
//     if (req.user._id !== req.params.userId){
//       return res.status(403).json({ err: "Unauthorized"});
//     }

//     const user = await User.findById(req.params.userId);

//     if (!user) {
//       return res.status(404).json({ err: 'User not found.'});
//     }

//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ err: err.message });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


const SALT_LENGTH = 12;

router.post('/signup', async (req, res) => {
    try {
        // Check if the username is already taken
        const userInDatabase = await User.findOne({ username: req.body.username });
        if (userInDatabase) {
            return res.json({error: 'Username already taken.'});
        }
        // Create a new user with hashed password
        const user = await User.create({
            username: req.body.username,
            hashedPassword: bcrypt.hashSync(req.body.password, SALT_LENGTH)
        })
        const token = jwt.sign({ username: user.username, _id: user._id }, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
            const token = jwt.sign({ username: user.username, _id: user._id }, process.env.JWT_SECRET);
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Invalid username or password.' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;