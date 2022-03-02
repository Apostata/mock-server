const jsonServer = require("json-server");
// const constants = require("./constants");
const db = require("./data/adorarte/db-adorarte");
const server = jsonServer.create();
const router = jsonServer.router(db);
const singular = require("./singular");
const middlewares = jsonServer.defaults();
const port = 3002;


server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use(singular);

// Add this before server.use(router)
server.use(
  jsonServer.rewriter({
    // "/v1/*": "/$1",
    
    "/areas": "/areas",
  })
);

// Use default router
server.use(router);
server.listen(port, () => {
  console.log("Adorarte Mock Server is running on port " + port);
});
