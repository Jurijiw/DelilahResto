const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemsSchema = new Schema({
    idProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    amount: {
        type: Number,
        require: true,
        min: 1
    },
    orderId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    }
});

function createItemModel() {
    const ItemSchema = mongoose.model('Item', itemsSchema);
    return ItemSchema;
}

module.exports = {
    createItemModel,
}