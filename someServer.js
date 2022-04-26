const jsonServer = require("json-server");
var path = require('path');
var express = require('express')
const db = require("./data/someServer/db-someServer");
const server = jsonServer.create();
const router = jsonServer.router(db);
const singular = require("./singular");
const middlewares = jsonServer.defaults();
const port = 3003;


server.use('/static', express.static(path.join(__dirname, 'public')))

// Avoid CORS issue
server.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



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
        const {password:pass,  ...newUser} = authUser;
        // console.log(newUser)
        res.status(200).jsonp(newUser);
      } else{
        res.status(401).jsonp(null);
      }
    }, 1000);
      
    }

    if (req.url === "/users") {
      const database = router.db;
      const { body:{cpf, concilNumber} } = req;
      console.log(req.body);
      console.log(database.toJSON)
      const authUser = database.get("users").find({ cpf:cpf }).value() ?? null
      const hasConcilNum = database.get("concils").find({number: concilNumber}).value() ?? null
      setTimeout(() => {
        console.log(hasConcilNum)
        console.log(authUser)
        if(!authUser && hasConcilNum){
          const id = cpf==33265205819? '1': `${db.users.length + 1}`;
        const newUser = {id: id, ...req.body}
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
      }, 1000);
    }

    

    if (req.url.includes("/monitored")) {
     
      if (req.url.includes("?monitor=")) {
        console.log('get by monitor')
        const getIdRegex = /[0-9]+$/;
        console.log(req.url.match(getIdRegex));
        const id = req.url.match(getIdRegex)[0];
        const database = router.db;
        let monitoreds = database.get("monitored").value()
       const result = monitoreds.filter((user)=>{
         return user.monitor.id === id;
        })
        setTimeout(() => {
          if(result){
            res.status(200).jsonp(result);
          } else{
            res.status(401).jsonp(null);
          }
        }, 1000);
      }
      else{
        if (req.url.includes("/stats")) {
          console.log('get by monitored id stats')
          const getIdRegex = /(?<=\/)(\d+)(?=\/)/g;
          console.log(req.url.match(getIdRegex));
          const id = req.url.match(getIdRegex)[0];
          const database = router.db;
          const authCode = database.get("monitoredStats").find({userId: id }).value() ?? null
          setTimeout(() => {
            if(authCode){
              res.status(200).jsonp(authCode);
            } else{
              res.status(401).jsonp(null);
            }
          }, 1000);
         
        } else{
          let end = false;

          if (req.url.includes("/heartfrequency")) {
            end = true;
            if (req.url.includes("/daily")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];
              console.log(id);
              const database = router.db;
              const authCode = database.get("heartFrequencyDaily").filter((day, idx)=> day.userId === id && idx <=5).value() ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/weekly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("heartFrequencyWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/monthly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("heartFrequencyMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
          } 
          if (req.url.includes("/bloodPresure")) {
            end = true;
            if (req.url.includes("/daily")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];
              console.log(id);
              const database = router.db;
              const authCode = database.get("bloodPresureDaily").filter((day, idx)=> day.userId === id && idx <=5).value() ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/weekly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              console.log(database.get("bloodPresureWeekly").value())
              const authCode = database.get("bloodPresureWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/monthly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("bloodPresureMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
          }
          if (req.url.includes("/oxigenation")) {
            end = true;
            if (req.url.includes("/daily")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];
              console.log(id);
              const database = router.db;
              const authCode = database.get("oxigenationDaily").filter((day, idx)=> day.userId === id && idx <=5).value() ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/weekly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("oxigenationWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/monthly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("oxigenationMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
          }
          if (req.url.includes("/stepmeter")) {
            end = true;
            if (req.url.includes("/daily")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];
              console.log(id);
              const database = router.db;
              const authCode = database.get("stepMeterDaily").filter((day, idx)=> day.userId === id && idx <=5).value() ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/weekly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("stepMeterWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/monthly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("stepMeterMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
          }
          if (req.url.includes("/temperture")) {
            end = true;
            if (req.url.includes("/daily")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];
              console.log(id);
              const database = router.db;
              const authCode = database.get("tempertureDaily").filter((day, idx)=> day.userId === id && idx <=5).value() ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/weekly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("tempertureWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/monthly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("tempertureMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
          }
          if (req.url.includes("/respiratoryfrequency")) {
            end = true;
            if (req.url.includes("/daily")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];
              console.log(id);
              const database = router.db;
              const authCode = database.get("respiratoryFrequencyDaily").filter((day, idx)=> day.userId === id && idx <=5).value() ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/weekly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("respiratoryFrequencyWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/monthly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("respiratoryFrequencyMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
          }
          if (req.url.includes("/calories")) {
            end = true;
            if (req.url.includes("/daily")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];
              console.log(id);
              const database = router.db;
              const authCode = database.get("caloriesDaily").filter((day, idx)=> day.userId === id && idx <=5).value() ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/weekly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("caloriesWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/monthly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("caloriesMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
          }
          if (req.url.includes("/sleepmeter")) {
            end = true;
            if (req.url.includes("/daily")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];
              console.log(id);
              const database = router.db;
              const authCode = database.get("sleepMeterDaily").filter((day, idx)=> day.userId === id && idx <=5).value() ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/weekly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("sleepMeterWeekly").filter((day, idx)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000 && idx <=5).value() ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
            if (req.url.includes("/monthly")) {
              const getIdRegex = /[0-9]+/g;
              const id = req.url.match(getIdRegex)[0];

              const database = router.db;
              const authCode = database.get("sleepMeterMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] ?? null
              setTimeout(() => {
                if(authCode){
                  res.status(200).jsonp(authCode);
                } else{
                  res.status(401).jsonp(null);
                }
              }, 1000);
            }
          }
          if(!end){
            console.log('get by monitored id')
            const getIdRegex = /[0-9]+$/;
            console.log(req.url.match(getIdRegex));
            const id = req.url.match(getIdRegex)[0];
            const database = router.db;
            const authCode = database.get("monitored").find({id: id }).value() ?? null
            setTimeout(() => {
              if(authCode){
                res.status(200).jsonp(authCode);
              } else{
                res.status(401).jsonp(null);
              }
            }, 1000);
          }
         
        }
      }
    }

    if(req.url.includes("/plans")){
      const database = router.db;
          const authCode = database.get("plans").value() ?? null
          setTimeout(() => {
            if(authCode){
              res.status(200).jsonp(authCode);
            } else{
              res.status(401).jsonp(null);
            }
          }, 1000);
    }

    if(req.url.includes("/users")){
        if (req.url.includes("/subscription")) {
          const getIdRegex = /[0-9]+/g;
          const id = req.url.match(getIdRegex)[0];
          console.log(id);
          const database = router.db;
          const authCode = database.get("subscriptions").filter((day)=> day.userId === id).value() ?? null
          setTimeout(() => {
            if(authCode){
              res.status(200).jsonp(authCode);
            } else{
              res.status(401).jsonp(null);
            }
          }, 1000);

        }
    }
   
  }

  if(req.method === 'PUT'){
    if (req.url.includes("/users")) {
      const getIdRegex = /[0-9]+$/;
      console.log(req.url.match(getIdRegex));
      const id = req.url.match(getIdRegex)[0];
      const database = router.db;
      const { body } = req;
      console.log(req.body);
      console.log(database.toJSON)
      const authUser = database.get("users").find({id: id }).value() ?? null
      setTimeout(() => {
        if(authUser){
        const newUser = {...authUser, ...body}
        // console.log(newUser)
        res.status(200).jsonp(newUser);
      } else{
        if(authUser){
          res.status(400).jsonp({message:'userError'});
        }
      }
    }, 1000);
      
    }

  }

  if(req.method === 'PATCH'){
    if (req.url.includes("/users")) {
      const getIdRegex = /[0-9]+$/;
      console.log(req.url.match(getIdRegex));
      const id = req.url.match(getIdRegex)[0];
      const database = router.db;
      const { body } = req;
      console.log(req.body);
      console.log(database.toJSON)
      const authUser = database.get("users").find({id: id }).value() ?? null
      setTimeout(() => {
        if(authUser){
        const newUser = {...authUser, ...body}
        // console.log(newUser)
        res.status(200).jsonp(newUser);
      } else{
        if(authUser){
          res.status(400).jsonp({message:'userError'});
        }
      }
    }, 1000);
      
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
    "/concils": "/concils",
    "/monitored/:id/heartfrequency/daily": "/monitored/:id/heartfrequency/daily",
    "/monitored/:id/heartfrequency/weekly": "/monitored/:id/heartfrequency/weekly",
    "/monitored/:id/heartfrequency/monthly": "/monitored/:id/heartfrequency/monthly",
    "/monitored/:id/stats": "/monitored/:id/stats",
    "/monitored/:id": "/monitored/:id",
    "/monitored/": "/monitored/",
    // "/heartFrequency/daily": "/heartFrequency/daily",
    // "/heartFrequency/weekly": "/heartFrequency/weekly",
    // "/heartFrequency/monthly": "/heartFrequency/monthly",
  })
);

// Use default router
server.use(router);
server.listen(port, () => {
  console.log("Adorarte Mock Server is running on port " + port);
});
