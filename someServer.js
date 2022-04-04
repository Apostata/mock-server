const jsonServer = require("json-server");
const db = require("./data/someServer/db-someServer");
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
      const authUser = database.get("users").find({email:email, password:password }).value() ?? null
      console.log(authUser)
      setTimeout(() => {
        if(authUser){
        const {password:pass, cpf, type, concilNumber, ...newUser} = authUser;
        // console.log(newUser)
        res.status(200).jsonp(newUser);
      } else{
        res.status(401).jsonp(null);
      }
    }, 1000);
      
    }

    if (req.url === "/users") {
      const database = router.db;
      const { body:{ email, cpf, concilNumber} } = req;
      console.log(req.body);
      console.log(database.toJSON)
      const authUser = database.get("users").find({email: email, cpf:cpf }).value() ?? null
      const hasConcilNum = database.get("concils").find({number: concilNumber}).value() ?? null
      setTimeout(() => {
        console.log(hasConcilNum)
        console.log(authUser)
        if(!authUser && hasConcilNum){
        const newUser = {id: `${db.users.length + 1}`, ...req.body}
        // console.log(newUser)
        res.status(200).jsonp(newUser);
      } else{
        if(authUser){
          res.status(400).jsonp({message:'userError'});
        }
        if(!hasConcilNum){
          res.status(400).jsonp({message:'concilError'});
        }
      }
    }, 1000);
      
    }

    if (req.url === "/getcode") {
      const database = router.db;
      const { body:{email} } = req;
      console.log(req.body);
      console.log(database.toJSON)
      const authUser = database.get("getcode").find({email: email}).value() ?? null
      setTimeout(() => {
        if(authUser){

          res.status(200).jsonp(null);
        } else{
          res.status(401).jsonp(null);
        }
      },100)
    }

    if (req.url === "/resetPassword") {
      const database = router.db;
      const { body:{email, password} } = req;
      console.log(req.body);
      console.log(database.toJSON)
      const authUser = database.get("getcode").find({email: email}).value() ?? null
      setTimeout(() => {
        if(authUser && authUser.password != password){

          res.status(200).jsonp(null);
        } else{
          res.status(401).jsonp(null);
        }
      },1000)
    }
    
  }

  if(req.method === "GET"){
    if (req.url.includes("/verifycode")) {
      console.log(req.url, req.query, req.path, req.body, req.headers)
      const getIdRegex = /[0-9]+[^\/]/g;
      const code = req.url.match(getIdRegex)[0];
      const database = router.db;
      const authCode = database.get("verifycode").find({code: Number(code) }).value() ?? null
      setTimeout(() => {
        if(authCode){
          res.status(200).jsonp(null);
        } else{
          res.status(401).jsonp(null);
        }
      });
    }
  }
 
});

// Add this before server.use(router)
server.use(
  jsonServer.rewriter({
    "/login": "/users",
    "/getcode": "/getcode",
    "/verifycode/:code": "/verifycode/:code",
    "/users": "/users",
    "/concils": "/concils"
  })
);

// Use default router
server.use(router);
server.listen(port, () => {
  console.log("Adorarte Mock Server is running on port " + port);
});
