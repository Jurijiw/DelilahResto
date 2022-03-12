const { createUsersModel } = require('../../model/models/users');
const { createPaymentMethodModel } = require('../../model/models/paymentMethods');
const { createOrderModel } = require('../../model/models/orders');
const { createProductModel } = require('../../model/models/products');
const { createItemModel } = require('../../model/models/items');
const { getIdFromToken } = require('../../model/models/users')

const User = createUsersModel();
const PM = createPaymentMethodModel();
const Order = createOrderModel();
const Product = createProductModel();
const Item = createItemModel();

async function validateEmail(req, res, next) {
    const { email } = req.body;
    try {
        const verifyUserEmail = await User.findOne({ email });
        if (verifyUserEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'Your email is already registered. Please, log in.'
            });
        } 
        return next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Unexpected error.'
        });
    }
}

async function validateUsername(req, res, next) {
    const { username } = req.body;
    try {
        const verifyUsername = await User.findOne({ username });
        if (verifyUsername) {
            return res.status(400).json({
                ok: false,
                msg: 'This username already exists.'
            });
        } 
        return next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Unexpected error.'
        });
    }
}


async function validatePMID(req, res, next) {
    const idPM = req.params.id;
    try {
        const verifyPM = await PM.findOne({ _id: idPM });
        if (verifyPM) {
            return next();
        } 
        return res.status(400).json({
            ok: false,
            msg: 'Payment Method does not exist.'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Unexpected error.'
        });
    }
} 

async function validateExistingPM(req, res, next) {
    const detailPM = req.body.detail;
    try {
        const verifyPM = await PM.findOne({ detail: detailPM });
        if (!verifyPM) {
            return next();
        } 
        return res.status(400).json({
            ok: false,
            msg: 'Payment Method already exists.'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Unexpected error.'
        });
    }
} 

async function validate1pendingOrder(req, res, next) {
    const idUser = getIdFromToken(req.headers.authorization);

    const pendingOrder = await Order.findOne({status: 1, userId: idUser});

    if ( pendingOrder) {
        return res.status(400).json({
            ok: true,
            orderNumber: pendingOrder._id,
            msg: 'You have a pending order. Please check.'
        });
    }

    return next();
}

async function validateOrderStatus(req, res, next) {
    const orderID = req.params.idOrder;

    const pendingOrder = await Order.find({_id: orderID}, {status: 1});
    if ( !pendingOrder ) {
        return res.status(400).json({
            ok: true,
            msg: 'You do not have a pending order. Please check.'
        });
    }
    return next();
}

async function validateOrderStatusPending(req, res, next) {
    const orderID = req.params.idOrder;

    const pendingOrder = await Order.find({_id: orderID, status:1});
    if ( !pendingOrder ) {
        return res.status(400).json({
            ok: true,
            msg: 'You do not have a pending order. Please check.'
        });
    } else {
        return next();
    }

}

async function validateOrder(req, res, next) {
    const orderID = req.params.idOrder;

    const order = await Order.findById({_id: orderID});
    if ( !order ) {
        return res.status(400).json({
            ok: true,
            msg: 'Please check order id.'
        });
    } else {
        return next();
    }

}

async function validateProduct(req, res, next) {

    if (req.headers.idprod === null || req.headers.idprod === undefined || req.headers.idprod === '') {  
        return next();
    } else {
        const idProd = req.headers.idprod;
        const product = await Product.find({_id: idProd}, {active: true});
        if ( !product ) {
            return res.status(400).json({
                ok: true,
                msg: 'Can not find product by id. Please check.'
            });
        }
        return next();
    }

}

async function validateExistingProduct(req, res, next) {

    if (req.params.id === null || req.params.id === undefined || req.params.id === '') {  
        return next();
    } else {
        const idProd = req.params.id;
        const product = await Product.find({_id: idProd}, {active: true});
        if ( !product ) {
            return res.status(400).json({
                ok: true,
                msg: 'Can not find product by id. Please check.'
            });
        }
        return next();
    }

}

async function validateItem(req, res, next) {
    const idItem = req.params.idItem;

    const item = await Item.find({_id: idItem});
    if ( !item ) {
        return res.status(400).json({
            ok: true,
            msg: 'Can not find this product on your order. Please check.'
        });
    }
    return next();
}

async function validateOrderByUser(req, res, next) {
    const userId = getIdFromToken(req.headers.authorization);
    const orderID = req.params.idOrder;
    console.log('1', userId, '2',orderID)
    const existingOrder = await Order.findById(orderID);
    console.log(existingOrder)
    if ( existingOrder ) {
        if ( existingOrder.userId == userId ) {    
            return next();
        }
        return res.status(400).json({
            ok: true,
            msg: 'Please check selected order.'
        });
    } else {
        return res.status(400).json({
            ok: true,
            msg: 'Non-existent order. Please check.'
        });
    }
}

module.exports = {
    validateEmail,
    validateUsername,
    validatePMID,
    validate1pendingOrder,
    validateOrderStatusPending,
    validateOrder,
    validateOrderByUser,
    validateOrderStatus,
    validateProduct,
    validateItem,
    validateExistingPM,
    validateExistingProduct
}