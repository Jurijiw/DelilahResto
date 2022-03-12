const express = require('express');
const { createPaymentMethodModel } = require('../../model/models/paymentMethods');

const { isAuth, isAdmin } = require('../middlewares/auth');
const { validatePMID, validateExistingPM } = require('../middlewares/validators');

const PMethod = createPaymentMethodModel();
//Funcionan todas
function createRouterPM() {
    const router = express.Router();

    router.get('/paymentMethods', isAuth, async (req, res) => {
        const actives = await PMethod.find({active: true}, {active:0, __v:0});
        const inactives = await PMethod.find({active: false}, {active:0, __v:0});
        res.status(200).send({
                    ok: true,
                    actives: actives,
                    inactives: inactives
                });
    });

    router.post('/paymentMethods', isAdmin, validateExistingPM, async (req, res) => {
        try {
            const pm = new PMethod(req.body);
            await pm.save();

            res.status(200).send({
                ok: true,
                newPM: pm
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            });
        }
        
    });

    router.put('/paymentMethods/:id', isAdmin, validatePMID, async (req, res) => {
        const idPM = req.params.id;
        try {
            const currentChanges = {
                ...req.body
            }
            const updatedPM = await PMethod.findByIdAndUpdate( idPM, currentChanges, { new: true } );
            res.status(200).json({
                ok: true,
                pmethod: updatedPM
            });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            })
        }
    });
 
    router.delete('/paymentMethods/:id', isAdmin, validatePMID, async (req, res) => {
        const idPM = req.params.id;
        try {
            const deletedPM = await PMethod.findByIdAndRemove(idPM);
            res.status(200).json({
                ok: true,
                msg: `Payment Method '${deletedPM.detail}' has been deleted successfully.`
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            })
        }
    });

    return router;
}

module.exports = {
    createRouterPM
}