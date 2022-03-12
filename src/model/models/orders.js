const mongoose = require('mongoose');
const { Schema } = mongoose;

const ordersSchema = new Schema({
    detail: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: Number,
        required: true,
        default: 1
    },
    paymentMethod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMethod',
    },
    address: {
        type: Object,
    },
    date: {
        type: Date,
    }
});

function createOrderModel() {
    const OrderSchema = mongoose.model('Order', ordersSchema);
    return OrderSchema;
}

module.exports = {
    createOrderModel,
}