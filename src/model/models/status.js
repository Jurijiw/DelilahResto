const mongoose = require('mongoose');
const { Schema } = mongoose;

const statusSchema = new Schema({
    detail:  {
        type: String,
        required: true,
        unique: true
    },
    idNumber : {
        type: Number,
        required: true,
        unique: true
    }
});

function createStatusModel() {
    const Status = mongoose.model('Status', statusSchema);
    return Status;
}

module.exports = {
    createStatusModel,
}