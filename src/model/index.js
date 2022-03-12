const mongoose = require('mongoose');
const dotenv = require("dotenv");

const { createUsersModel } = require('./models/users');
const { createStatusModel } = require('./models/status');
const { createProductModel } = require('./models/products');
const { createPaymentMethodModel } = require('./models/paymentMethods');
const { createOrderModel } = require('./models/orders');
const { createItemModel } = require('./models/items');

async function initDatabase() {

  dotenv.config();
  const pass = process.env.DB_PASS;
  const user = process.env.DB_USER;
  const bd = process.env.DB_NAME;

  const url = `mongodb+srv://${user}:${pass}@clusterlia.trgzc.mongodb.net/${bd}?retryWrites=true&w=majority`;
  //const url = `mongodb+srv://admin:DAtZVZ4QyiNZlwVa@clusterlia.trgzc.mongodb.net/Acamica?retryWrites=true&w=majority`;

  const initDB = new Promise((resolve, reject) => {

      mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

      const db = mongoose.connection;
      db.on('error', (error) => {
          console.error('connection error:', error);
          reject(error);
      });

      db.once('open', function () {
          console.log('MongoDb is ready...')
          resolve(db);
          const Users = createUsersModel();
          const Status = createStatusModel();
          const Products = createProductModel();
          const PaymentMethods = createPaymentMethodModel();
          const Orders = createOrderModel();
          const Items = createItemModel();
          resolve({
            Users,
            Status,
            Products,
            PaymentMethods,
            Orders,
            Items
          });
      })
  })

  return initDB;
}

module.exports = {
  initDatabase
}