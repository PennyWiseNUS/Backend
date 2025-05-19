// defines auth routes
const express = require('express');
const router = express.Router(); // handle routes separately from main app -- register and login
const bcrypt = require('bcryptjs'); // securely hashing passwords
const jwt = require('jsonwebtoken'); // creating a token after login/register
const User = require('../models/User'); // mongoose database in models

// register route
router.post('/register', async (req, res) => { // triggered when frontend makes a POST req to /api/auth/register
    const {email, password} = req.body; // email & password from frontend

    try {
        // pause execution of the func till findOne() finishes running
        // wait for res of db query
        // assign result to var user
        let user = await User.findOne({ email });
        // checks if user with the email exist
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        
        // create a new User object if it does not exist
        user = new User({
            email,
            password
        });

        // generate a cryptographic salt w 10 rnds of complexity, wait for it to finish before continuing
        const noise = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, noise);
        await user.save();

        // creating an access token
        const payload = {
            user: {
                id: user.id
            }
        };
        // signing (verifying) the payload and returning a token
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            // sends token back to client, stored in local/sessionStorage or HTTPonlyCookie
            // on future requests, client sends token in auth header
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// login route
router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        // check for whether the email is present
        let user = await User.findOne({email});
        // check for cases that will return an error first
        // case 1: wrong email
        if (!user) {
            return res.status(400).json({msg:'Invalid Email or Password'});
        }
        // case 2: email correct, password wrong
        const isPasswordEqual = await bcrypt.compare(password, user.password);
        if (!isPasswordEqual) {
            return res.status(400).json({msg: 'Invalid Email or Password'});
        }
        // both email and password are correct
        // create access token
        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1hr'}, (req, res) => {
            // return the token to the client
            if (err) throw err;
            res.json({token});
        });        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// create an export 
module.exports = router;