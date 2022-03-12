const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    detail:  {
        type: String,
        required: true,
        unique: true
    },
    price:  {
        type: Number,
        required: true,
        min: 1
    },
    active:  {
        type: Boolean,
        default: true
    },
});

function createProductModel() {
    const Product = mongoose.model('Product', productSchema);
    return Product;
}

module.exports = {
    createProductModel,
}