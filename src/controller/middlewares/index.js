const express = require('express');
const helmet = require('helmet');
const { loadDocumentation } = require('../middlewares/documentation');

function prepareMiddlewares(server) {
  server.use(helmet());
  server.use(express.json());
  server.use(express.urlencoded({extended: false}));
  loadDocumentation(server);
}

module.exports = {
  prepareMiddlewares
};