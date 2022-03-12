const { Router } = require("express");
const { isAuth, authorize } = require("../middlewares/auth");

function createHomeRouter() {
  const router = Router();

  router.post('/login', authorize, (req, res) => {})

  return router;
}

module.exports = {
  createHomeRouter
}