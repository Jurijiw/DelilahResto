const { createHomeRouter } = require("./login");
const { createRouterPM } = require("./paymentMethod");
const { createRouterUser } = require("./user");
const { createRouterProduct } = require("./product");
const { createRouterOrder } = require("./order");


const version = '/api/v2';

function loadRouters(server) {

  server.use(version, createHomeRouter());
  server.use(version, createRouterUser());
  server.use(version, createRouterPM());
  server.use(version, createRouterProduct());
  server.use(version, createRouterOrder());
}

module.exports = {
  loadRouters
}