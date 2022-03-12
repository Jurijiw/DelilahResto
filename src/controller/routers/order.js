const express = require('express');
const { isAuth, isAdmin } = require('../middlewares/auth');
const { validate1pendingOrder, validateOrderByUser, validateOrderStatus, 
        validateProduct, validateItem, validateOrderStatusPending,
        validateOrder } = require('../middlewares/validators');

const { createOrderModel } = require('../../model/models/orders');
const { createProductModel } = require('../../model/models/products');
const { createItemModel } = require('../../model/models/items');
const { createUsersModel, getIdFromToken } = require('../../model/models/users');
const { createPaymentMethodModel } = require('../../model/models/paymentMethods');

const Order = createOrderModel();
const Product = createProductModel();
const Item = createItemModel();
const User = createUsersModel();
const PMethod = createPaymentMethodModel();


function createRouterOrder() {
    const router = express.Router();

    router.get('/users/orders', isAuth, async (req, res) => {
        const idUser = getIdFromToken(req.headers.authorization);
        try {
            const allOrders = await Order.find({userId: idUser}).populate('detail', 'idProduct amount');
            if (allOrders.length < 1) {
                return res.status(400).json({
                    ok: true,
                    msg: 'You do not have order history.'
                });
            }
            return res.status(200).send({
                ok: true,
                id_usuario: idUser,
                all_orders: allOrders
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            });
        }       
    });
    
    router.post('/users/orders', isAuth, validate1pendingOrder, async (req, res) => {
        try {
            const idUser = getIdFromToken(req.headers.authorization);

            const order = new Order( {userId: idUser} );

            await order.save();
    
            res.status(200).json({
                ok: true,
                newOrder: order,
                msg: 'Ready to add products.'
            });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            });
        }
    });
    
    router.get('/users/orders/:idOrder', isAuth, validateOrderByUser, async (req, res) => {
        try {
            const idOrder = req.params.idOrder;
            const existingOrder = await Order.find( {_id: idOrder } ).populate('detail', 'idProduct amount');

            return res.status(200).send({
                ok: true,
                order: existingOrder});
            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    ok: false,
                    msg: 'Unexpected error.'
                });
            }
    });
    
    //Agregar producto
    router.put('/users/orders/:idOrder', isAuth, validateOrderByUser, validateProduct, async (req, res) => {
        try{

            const idOrder = req.params.idOrder;
            const order = await Order.findOne({ _id: idOrder });

            if ( order && order.status === 1) {
                if (req.headers.idprod === null || req.headers.idprod === undefined || req.headers.idprod === '') {
                    const status = Number(req.headers.status);
                    const address = Number(req.headers.address);
                    const pm = req.headers.pm;

                    const user = await User.findOne({ _id: order.userId });

                    const existingPM = await PMethod.findById({_id: pm})
                    if ( !existingPM ) {
                        return res.status(200).json({
                            ok: true,
                            msg: 'Verify payment method please.'
                        });
                    }

                    const update = {
                        date: new Date(),
                        status: 2,
                        address: {
                            street: user.addresses[address].street,
                            number: user.addresses[address].number,
                            city: user.addresses[address].city,
                            province: user.addresses[address].province
                        },
                        paymentMethod: pm
                    }

                    if (status === 2) {
                        const orderUpdated = await Order.findOneAndUpdate({ _id: idOrder }, update);

                        return res.status(200).json({
                            ok: true,
                            msg: `Your order has been confirmed`
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        msg: 'Incorrect status.'
                    });

                } else {
                    const idProduct = req.headers.idprod;
                    const amount = req.headers.amount;

                    const product = await Product.findOne({ _id: idProduct });

                    if (product) {
                        const item = new Item({idProduct, amount, orderId: idOrder});    
                        await item.save();
    
                        order.detail.push(item._id);
                        order.save();

                        return res.status(200).json({
                            ok: true,
                            msg: order
                        });
                    }
    
                    return res.status(200).json({
                        ok: true,
                        msg: `Please verify product ID`
                    });
                }
            }

            return res.status(500).json({
                ok: false,
                msg: 'You can not modify an order which status is not pending.'
            }); 

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            }); 
        }
    });

    //Modificar cantidad de un producto
    router.put('/users/orders/:idOrder/:idItem', isAuth, validateOrderByUser, validateOrderStatusPending, validateItem, async (req, res) => {
        try{
            const idItem = req.params.idItem;
            const newAmount = Number(req.headers.amount);
            
            const item = await Item.findOne({ _id: idItem });

            if ( item ) {
                const updatedItem = await Item.findByIdAndUpdate({ _id: idItem }, {amount: newAmount});

                return res.status(200).json({
                    ok: true,
                    msg: `Your order has been updated. New amount: ${newAmount}`
                });
            }            

            return res.status(200).json({
                ok: true,
                msg: `Please verify product ID`
            });


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            }); 
        }
    });

    //Eliminar un producto
    router.delete('/users/orders/:idOrder/:idItem', isAuth, validateOrderByUser, validateOrderStatus, validateItem, async (req, res) => {
        try{
            const idOrder = req.params.idOrder;
            const idItem = req.params.idItem;

            const item = await Item.findOne({ _id: idItem });
            const order = await Order.findOne({ _id: idOrder });

            if ( item ) {
                const deletedItem = await Item.findOneAndDelete({ _id: idItem });

                order.detail.pull({ _id: idItem }) 

                return res.status(200).json({
                    ok: true,
                    deletedItem: deletedItem
                });
            }            
            return res.status(200).json({
                ok: true,
                msg: `Please verify product ID`
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            }); 
        }
    });

       
    router.use(isAdmin);

    router.get('/orders', async (req, res) => {
        const orders = await Promise.all([
            Pendiente = getOrderByStatus(1),
            Confirmado = getOrderByStatus(2),
            EnPreparacion = getOrderByStatus(3),
            Enviado = getOrderByStatus(4),
            Entregado = getOrderByStatus(5) 
        ])
        
        res.status(200).send({
            ok: true,
            pendiente: orders[0],
            confirmado: orders[1],
            enPreparacion: orders[2],
            enviado: orders[3],
            entregado: orders[4]
        });
    });
 
    router.get('/orders/:idOrder', validateOrder, async (req, res) => {
        const idOrder = req.params.idOrder;
        const order = await Order.findById({_id: idOrder}).populate('userId', 'name username email phoneNumber');

        res.status(200).send({
            ok: true,
            order: order          
        });
    });

    router.put('/orders/:idOrder', validateOrder, async (req, res) => {
        const idOrder = req.params.idOrder;
        const order = await Order.findById({_id: idOrder, status: 2});
        const validStatus = [2,3,4,5];

        if ( order ) {
            const status = Number(req.headers.status);
            if ( validStatus.includes(status) ) {
                
                const orderUpdated = await Order.findByIdAndUpdate({ _id: idOrder }, { status });
                
                return res.status(200).send({
                    ok: true,
                    msg: `Updated Status. Order ${order._id}, status: ${status}`
                });
            }
            return res.status(400).send({
                ok: true,
                msg: 'Please verify enter status.'
            });
        }
        return res.status(400).send({
            ok: true,
            msg: 'Please verify order id'
        });
    });

    return router;
}

function getOrderByStatus(status) {
    const orders = Order.find({status: status}).sort('date').populate('detail', 'idProduct amount');
    return orders;
}

module.exports = {
    createRouterOrder
}