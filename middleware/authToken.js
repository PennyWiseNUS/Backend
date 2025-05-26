const jwt = require('jsonwebtoken');

// req: incoming req obj (token/headers) res: res obj sent back to client
// next() is like the permission to proceed -- passes control to the next middleware OR to the route handler
const authToken = (req, res, next) => {
    // check for the token, return undefined if not found (opt chaining)
    const token = req.headers['authorization']?.split(' ')[1];
    console.log(req.headers);
    // no token scenerio
    if (!token) {
        // throw an error that shows the token has not been provided
        console.log('No token provided');
        return res.status(401).json({msg: "Token not provided"});
    };
    // if token provided, proceed to do verification using jwt.verify
    // callback function will be accounting for valid: user and invalid:err
    console.log('Token: ', token)
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed: ', err.message)
            return res.status(403).json({msg: "Incorrect token"});
        } else {
            console.log('Decoded user: ', user);
            req.user = user;
            next();
        };
    });
};

module.exports = authToken;