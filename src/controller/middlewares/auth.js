const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { config } = require("dotenv");
const { createUsersModel } = require('../../model/models/users');

let models = {};
config();

async function authorize(req, res, next) {
  try {
    const JWT_PASS = global.process.env.JWT_PASS;

    const password = req.body.password;

    const salt = bcryptjs.genSaltSync();
    passwordEncrypt = bcryptjs.hashSync(password, salt);

    let q={};
    if (!req.body.username) {
      const email = req.body.email;
      q = {
        email: email,
        password: passwordEncrypt
      };
    } else {
      const username = req.body.username;
      q = {
        username: username,
        password: passwordEncrypt
      };
    }
    
    const User = createUsersModel();
    let user = {};
    if (q.username){
      user = await User.findOne({username: q.username}).exec();
    }
    else {
      user = await User.findOne({email: q.email}).exec();
    }
    
    if (user && user.active === true) {
      const validPass = bcryptjs.compareSync( password, user.password);

      if (!validPass) {
        return res.status(400).json({
          ok: false,
          msg: 'Invalid password.'
        });
      }

      const token = jwt.sign({_id: user._id, admin: user.admin, active: user.active}, JWT_PASS);
      res.status(200).json({
          token: token
        });
      return next();
    } else {
      res.status(401).json({
        message: 'Unauthorized login.'
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: 'Invalid Credentials.'
    });
  }
}

function isAuth(req, res, next) {
  const bearer = req.headers.authorization
  const token = (bearer !== undefined ? bearer : '').replace('Bearer ', '');
  const JWT_PASS = process.env.JWT_PASS;
  jwt.verify(token, JWT_PASS, (error, decoded) => {
      if (error) {
        res.status(401).json({
          message: 'Invalid Credentials.'
        });
      } else {
        if (decoded.active === true) {
          console.log('decoded:', decoded);
          return next();
        }
        res.status(401).json({
          message: 'Sorry, your user is locked.'
        });
      }
    });
}

async function isAdmin(req, res, next) {
  const bearer = req.headers.authorization
  const token = (bearer !== undefined ? bearer : '').replace('Bearer ', '');
  const JWT_PASS = process.env.JWT_PASS;
  jwt.verify(token, JWT_PASS, function(error, decoded) {
    if (error) {
      res.status(401).json({
          message: 'Invalid Credentials.'
        })
    } else {
      if (decoded.admin === true && decoded.active === true) {
        console.log('decoded:', decoded);
        return next();
      }
      res.status(401).json({
        message: 'You must be an admin user to access here and your account must be active.'
      })
    }
  });
}

function setModels(_models) {
  models = _models;
}

module.exports = {
  isAuth,
  setModels,
  authorize,
  isAdmin,
};