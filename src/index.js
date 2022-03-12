const express = require("express");
const { config } = require("dotenv");
const { prepareMiddlewares } = require("./controller/middlewares");
const { loadRouters } = require("./controller/routers");
const { initDatabase } = require("./model/index");
const { initialize } = require("./db/initialize");

const { setModels } = require("./controller/middlewares/auth");

async function main() {
  config();
  const PORT = global.process.env.PORT;
  const server = express();
  const models = await initDatabase();

  setModels(models);
  prepareMiddlewares(server);
  loadRouters(server);

  initialize();

  server.listen(PORT, () => {
    console.log(`Server is ready at http://localhost:${PORT} - Documentation: http://localhost:${PORT}/api/v2/api-docs/`);
  });
}


main();