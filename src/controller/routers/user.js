const express = require('express');
const bcryptjs = require('bcryptjs');

const { createUsersModel } = require('../../model/models/users');
const { isAdmin, isAuth } = require('../middlewares/auth');
const { validateEmail, validateUsername } = require('../middlewares/validators');

const User = createUsersModel();

function createRouterUser() {
    const router = express.Router();

    router.get('/users', isAdmin, async (req, res) => {
        try {
            const users = await User.find({}, {password:0, __v:0});
            if (!users) {
                res.status(200).send({
                    ok: true,
                    msg: 'No registered users.'
                });
            } else {
                res.status(200).send({
                    ok: true,
                    users: users
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            });
        }
    });

    router.post('/users', validateEmail, validateUsername, async (req, res) => { 
        try {
            const user = new User(req.body);

            const salt = bcryptjs.genSaltSync();
            user.password = bcryptjs.hashSync(user.password, salt);
    
            await user.save();
    
            res.status(200).json({
                ok: true,
                newUser: user
            });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            });
        }

    });

    router.put('/users/:id', isAdmin, async (req, res) => {
        const id = req.params.id;
        try {
            const verifyUser = await User.findOne({ _id: id });
            if (verifyUser) {
                const suspendedAccount = await User.findByIdAndUpdate( id, {active: false}, { new: true } );
                return res.status(200).json({
                            ok: true,
                            account: suspendedAccount
                        })
            } 
            return res.status(400).json({
                ok: false,
                msg: 'User does not exist.'
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            });
        }
    });

    router.delete('/users/test', async (req, res) => {
        try {
            const user = await User.findOneAndDelete({ username: "test" });
            res.status(200).json({
                ok: true,
                msg:'Deleted user.'
            });
        } catch {
            res.status(400).json({
                ok: false,
                msg:'Error.'
            });
        }
    });

    return router;
}

module.exports = {
    createRouterUser
}