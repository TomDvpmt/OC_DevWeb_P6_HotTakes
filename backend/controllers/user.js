const bcrypt = require ("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
        .then(() => res.status(201).json({message: "User created !"}))
        .catch(() => res.status(400).json({message: "Signup failed."}));
    })
    .catch(() => res.status(500).json({message}));
};

exports.login = (req, res, next) => {
    User.findOne(({email: req.body.email}))
    .then(user => {
        if(user === null) {
            return res.status(401).json({message: "Invalid email or password."});
        } else {
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if(!valid) {
                    return res.status(401).json({message: "Invalid email or password."});
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            process.env.TOKEN_CREATION_PHRASE,
                            {expiresIn: "24h"}
                        )
                    })
                }
            })
            .catch(error => res.status(500).json({error}));
        }
    })
    .catch(error => res.status(500).json({error}));
};