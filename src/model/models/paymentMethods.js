const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentMethodSchema = new Schema({
    detail:  {
        type: String,
        required: true,
        unique: true
    },
    active:  {
        type: Boolean,
        default: true
    },
});

function createPaymentMethodModel() {
    const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
    return PaymentMethod;
}

module.exports = {
    createPaymentMethodModel,
}