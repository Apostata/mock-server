const jsonServer = require("json-server");
const constants = require("./constants");
const db = require("./db");
const server = jsonServer.create();
const router = jsonServer.router(db);
const singular = require("./singular");
const middlewares = jsonServer.defaults();
const port = 3001;

server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
// server.use((req, res, next) => {
//   if (req.method === "POST") {
//     req.body.createdAt = Date.now();
//   }
//   // Continue to JSON Server router
//   next();
// });
server.use(singular);
server.use((req, res, next) => {
  if (req.method === "GET") {
    const getIdRegex = /[0-9]+[^\/]/g;
    const path = req.url.replace(getIdRegex, ":id");
    const id = req.url.match(getIdRegex);
    console.log(path);
    console.log(id);
    if (req.url) {
    }
  }
  // Continue to JSON Server router
  next();
});

// Add this before server.use(router)
server.use(
  jsonServer.rewriter({
    "/v1/*": "/$1",
    "/exame/:id/marca/:mid/unidade/:uid/integracoes": "/integracoes",
    "/exame/:id/marca/:mid/unidade/:uid": "/preparos",
    "/exame/:id/marca/:mid/unidades": "/unidades?idProduto=:id&singular=1",
    "/exame/:id/marca/:mid": "/detalhe_exames/:id",
    "/exame/:mid/marca": "/marcas/:mid",
    "/exame/:id": "/detalhe_exames/:id",
    "/cadastro/list-combos": "/list_combos",
  })
);

// Use default router
server.use(router);
server.listen(port, () => {
  console.log("Mock Server is running on port " + port);
});
