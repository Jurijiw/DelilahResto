const express = require('express');
const { redisGet, redisSet, redisUpdate } = require('../middlewares/cache');

const { createProductModel } = require('../../model/models/products');
const { getIdFromToken } = require('../../model/models/users');
const { createOrderModel } = require('../../model/models/orders');

const { isAuth, isAdmin } = require('../middlewares/auth');
const { validateExistingProduct } = require('../middlewares/validators');
const Product = createProductModel();
const Order = createOrderModel();

function createRouterProduct() {
    const router = express.Router();

    router.get('/users/products', isAuth, async (req, res) => {

        try {
            const idUser = getIdFromToken(req.headers.authorization);
            const favs = await Order.find({userId: idUser}, {address:0, status:0, date:0, paymentMethod:0, __v:0}).populate('detail', 'idProduct');
            
            const cacheProducts = await redisGet('products');
            console.log(cacheProducts)
            if (cacheProducts) {
                const actives = JSON.parse(cacheProducts);

                return res.status(200).json({
                    ok: true,
                    favs: favs,
                    activeProducts: actives,
                });

            } else {
                const actives = await Product.find({active: true}, {active:0, __v:0});
                if (!actives) {
                    return res.status(400).send({
                        ok: true,
                        msg: 'Sorry. There are no products available now.'
                    });
                }

                redisSet('products', JSON.stringify(actives));

                return res.status(200).json({
                    ok: true,
                    favs: favs,
                    activeProducts: actives,
                });
            }
        } catch (error) {
            console.log(error)
        }

    });

    router.get('/products', isAdmin, async (req, res) => {
        const actives = await Product.find({active: true}, {active:0, __v:0});
        const inactives = await Product.find({active: false}, {active:0, __v:0});
        if (!actives && !inactives) {
            res.status(400).send({
                ok: true,
                msg: 'Sorry. There are no products available now.'
            });
        } else {
            res.status(200).send({
                ok: true,
                activeProducts: actives,
                inactiveProducts: inactives
            });
        }
    });

    router.post('/products', isAdmin, async(req, res) => {
        try {
            const product = new Product(req.body);    
            await product.save();
    
            res.status(200).json({
                ok: true,
                newProduct: product
            });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            });
        }
    });

    router.put('/products/:id', isAdmin, validateExistingProduct, async (req, res) => {
        const idProd = req.params.id;
        try {
            const currentChanges = {
                ...req.body
            }
            if (currentChanges.price < 1) {
                res.status(400).json({
                    ok: true,
                    msg: 'Please enter a valid price. It must be greater than 1.'
                });
            } else {
                const updatedProd = await Product.findByIdAndUpdate( idProd, currentChanges, { new: true } );
                const actives = await Product.find({active: true}, {active:0, __v:0});

                redisUpdate('products', JSON.stringify(actives));

                res.status(200).json({
                    ok: true,
                    product: 'Product has been updated.'
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Unexpected error.'
            })
        }
    });

    router.delete('/products/:id', isAdmin, validateExistingProduct, async (req, res) => {
        const idProd = req.params.id;
        try {
            const deletedProd = await Product.findByIdAndRemove(idProd);
            res.status(200).json({
                ok: true,
                msg: `Product has been deleted successfully.`
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
    createRouterProduct
}