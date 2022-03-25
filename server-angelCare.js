const jsonServer = require("json-server");
const db = require("./data/angel_care/db-angelCare");
const server = jsonServer.create();
const router = jsonServer.router(db);
const singular = require("./singular");
const middlewares = jsonServer.defaults();
const port = 3003;


server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use(singular);
server.use(async (req, res, next) => {
 

  if (req.method === "POST") {
    if (req.url === "/login") {
      const database = router.db;
      const { body:{email, password} } = req;
      console.log(req.body);
      console.log(database.toJSON)
      const authUser = database.get("login").find({email: email, password:password }).value() ?? null
      if(authUser){
      const newUser = {...authUser};
      delete newUser.password
      // console.log(newUser)
      res.status(200).jsonp(newUser);
      }
    }
  }

 
});

// Add this before server.use(router)
server.use(
  jsonServer.rewriter({
    // "/v1/*": "/$1",
    
    "/login": "/login",
  })
);

// Use default router
server.use(router);
server.listen(port, () => {
  console.log("Adorarte Mock Server is running on port " + port);
});
