const jsonServer = require("json-server");
var path = require('path');
var express = require('express')
const db = require("./data/someServer/db-someServer");
const server = jsonServer.create();
const router = jsonServer.router(db);
const singular = require("./singular");
const { devices } = require("./data/someServer/db-someServer");
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
      const authUser = database.get("auth").find({email:email, password:password }).value() || null
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
      const authUser = database.get("users").find({ cpf:cpf }).value() || null
      // const hasConcilNum = database.get("concils").find({number: concilNumber}).value() || null
      setTimeout(() => {
        // console.log(hasConcilNum)
        console.log(authUser)
        if(!authUser ){
          const id = cpf==33265205819? '1': `${db.users.length + 1}`;
        const newUser = {id:id, ...req.body, image:'http://192.168.0.21:3003/images/avatar-sample.jpeg'}
        console.log(newUser)
        res.status(200).jsonp(newUser);
      } else{
        if(authUser){
          res.status(400).jsonp({message:'userError'});
        }
        // if(!hasConcilNum){
        //   res.status(400).jsonp({message:'concilError'});
        // }
      }
    }, 1000);
      
    }

    if (req.url === "/getcode") {
      const database = router.db;
      const { body:{email} } = req;
      console.log(req.body);
      console.log(database.toJSON)
      const authUser = database.get("getcode").find({email: email}).value() || null
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
      const authUser = database.get("getcode").find({email: email}).value() || null
      setTimeout(() => {
        if(authUser && authUser.password != password){

          res.status(200).jsonp(null);
        } else{
          res.status(401).jsonp(null);
        }
      },1000)
    }

    if (req.url === "/subscriptions") {
      const database = router.db;
      const { body } = req;
      console.log(req.body);
      console.log(database.toJSON)
     
      const hasSubscription = database.get("subscriptions").find({name: body.name}).value() || null

      setTimeout(() => {
        if(!hasSubscription){
          const id = `${db.subscriptions.length + 1}`;
          const newSubscription = {id: id, ...body}
        // console.log(newUser)
        res.status(200).jsonp(newSubscription);
      } else{
          res.status(400).jsonp({message:'subscriptionErrror'});
        
      }
    }, 1000);
      
    }

    if (req.url === "/paymentMethods") {
      const database = router.db;
      const { body } = req;
      console.log(req.body);
      console.log(database.toJSON)
      let hasCard = false;

     if(body.type === "credit" || body.type === "debit"){
      hasCard = database.get("paymentMethods").find({cardNumber: Number(body.cardNumber)}).value() || false
     }

     const id = Number(body.cardNumber) === 4716087312077138? hasCard.id:`${db.paymentMethods.length + 1}`
       
      setTimeout(() => {
        if(!hasCard || Number(body.cardNumber) === 4716087312077138){
          
          const newSubscription = {id: id, ...body}
        // console.log(newUser)
        res.status(200).jsonp(newSubscription);
      } else{
          res.status(400).jsonp({message:'paymentMethods'});
        
      }
    }, 1000);
      
    }

    if (req.url.includes("/monitored")) {
   
      const database = router.db;
      const { body } = req;
      const monitored = database.get("monitored").find({name: body.name }).value() || null
      setTimeout(() => {
        if(!monitored){
          const id = `${db.monitored.length + 1}`;
          const newMonitored = {id: id, ...body}
        // console.log(newUser)
        res.status(200).jsonp(newMonitored);
      } else{
        if(monitored){
          res.status(400).jsonp({message:'monitoredError'});
        }
      }
    }, 1000);
      
    }
    
  }

  if(req.method === "GET"){
    if (req.url.includes("/verifycode")) {
      console.log(req.url, req.query, req.path, req.body, req.headers)
      const getIdRegex = /[0-9]+[^\/]/g;
      const code = req.url.match(getIdRegex)[0];
      const database = router.db;
      const authCode = database.get("verifycode").find({code: Number(code) }).value() || null
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
        const result =[];
        monitoreds.forEach((user)=>{
          user.monitors.forEach((monitor)=>{
            if(monitor.id === id && !result.includes(user)){
              result.push(user)
            }
          })
        });
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
          const authCode = database.get("monitoredStats").find({userId: id }).value() || null
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
              const authCode = database.get("heartFrequencyDaily").filter((day, idx)=> day.userId === id && idx <=5).value() || null
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
              const authCode = database.get("heartFrequencyWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] || null
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
              const authCode = database.get("heartFrequencyMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] || null
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
              const authCode = database.get("bloodPresureDaily").filter((day, idx)=> day.userId === id && idx <=5).value() || null
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
              const authCode = database.get("bloodPresureWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] || null
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
              const authCode = database.get("bloodPresureMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] || null
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
              const authCode = database.get("oxigenationDaily").filter((day, idx)=> day.userId === id && idx <=5).value() || null
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
              const authCode = database.get("oxigenationWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] || null
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
              const authCode = database.get("oxigenationMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] || null
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
              const authCode = database.get("stepMeterDaily").filter((day, idx)=> day.userId === id && idx <=5).value() || null
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
              const authCode = database.get("stepMeterWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] || null
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
              const authCode = database.get("stepMeterMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] || null
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
              const authCode = database.get("tempertureDaily").filter((day, idx)=> day.userId === id && idx <=5).value() || null
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
              const authCode = database.get("tempertureWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] || null
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
              const authCode = database.get("tempertureMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] || null
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
              const authCode = database.get("respiratoryFrequencyDaily").filter((day, idx)=> day.userId === id && idx <=5).value() || null
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
              const authCode = database.get("respiratoryFrequencyWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] || null
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
              const authCode = database.get("respiratoryFrequencyMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] || null
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
              const authCode = database.get("caloriesDaily").filter((day, idx)=> day.userId === id && idx <=5).value() || null
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
              const authCode = database.get("caloriesWeekly").filter((day)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000).value()[0] || null
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
              const authCode = database.get("caloriesMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] || null
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
              const authCode = database.get("sleepMeterDaily").filter((day, idx)=> day.userId === id && idx <=5).value() || null
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
              const authCode = database.get("sleepMeterWeekly").filter((day, idx)=> day.userId === id && day.weekStart >= 1649559600000 && day.weekEnd <= 1650164399000 && idx <=5).value() || null
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
              const authCode = database.get("sleepMeterMonthly").filter((day)=> day.userId === id && day.date >= 1648782000000 && day.date <= 1651373999000).value()[0] || null
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
            const authCode = database.get("monitored").find({id: id }).value() || null
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

    if (req.url.includes("/persons")) {
     
      if (req.url.includes("?monitor=")) {
        console.log('get by monitor')
        const getIdRegex = /[0-9]+$/;
        console.log(req.url.match(getIdRegex));
        const id = req.url.match(getIdRegex)[0];
        const database = router.db;
        let persons = database.get("persons").value()
        const result = [];

       persons.forEach((person)=> {
          person.monitors.forEach((monitor)=>{
          if(monitor.id === id){
            result.push(person);
          }
         })
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
        
            console.log('get by person id')
            const getIdRegex = /[0-9]+$/;
            console.log(req.url.match(getIdRegex));
            const id = req.url.match(getIdRegex)[0];
            const database = router.db;
            const authCode = database.get("persons").find({id: id }).value() || null
            setTimeout(() => {
              if(authCode){
                res.status(200).jsonp(authCode);
              } else{
                res.status(401).jsonp(null);
              }
            }, 1000);
          
      }
    }

    if(req.url.includes("/plans")){
      const database = router.db;
          const authCode = database.get("plans").value() || null
          setTimeout(() => {
            if(authCode){
              res.status(200).jsonp(authCode);
            } else{
              res.status(401).jsonp(null);
            }
          }, 1000);
    }

    if(req.url.includes("/users")){
        let end = false;
        
        if (req.url.includes("/subscription")) {
          end = true;
          const getIdRegex = /[0-9]+/g;
          const id = req.url.match(getIdRegex)[0];
          console.log(id);
          const database = router.db;
          const authCode = database.get("subscriptions").filter((day)=> day.userId === id).value() || null
          setTimeout(() => {
            if(authCode){
              res.status(200).jsonp(authCode);
            } else{
              res.status(401).jsonp(null);
            }
          }, 1000);

        }
        if (req.url.includes("/paymentTypes")) {
          end = true;
          const getIdRegex = /[0-9]+/g;
          const id = req.url.match(getIdRegex)[0];
          console.log(id);
          const database = router.db;
          const authCode = database.get("paymentsTypes").filter((day)=> day.userId === id).value() || null
          setTimeout(() => {
            if(authCode){
              res.status(200).jsonp(authCode);
            } else{
              res.status(401).jsonp(null);
            }
          }, 1000);

        }
        if (req.url.includes("/devices")) {
          end = true;
          const getIdRegex = /[0-9]+/g;
          const id = req.url.match(getIdRegex)[0];
          console.log(id);
          const database = router.db;
          const authCode = database.get("devices").filter((dev)=> dev.userId === id).value() || null
          setTimeout(() => {
            if(authCode){
              res.status(200).jsonp(authCode);
            } else{
              res.status(401).jsonp(null);
            }
          }, 1000);

        }
        if (req.url.includes("/paymentHistory")) {
          end = true;
          const getIdRegex = /[0-9]+/g;
          const id = req.url.match(getIdRegex)[0];
          const database = router.db;
          console.log(id)
          const payments = database.get("paymnetsHistory").filter((pay)=> pay.userId === id).value() || null
    
          setTimeout(() => {
            if(payments){
            res.status(200).jsonp(payments);
          } else{
              res.status(401).jsonp(null);
            
          }
        }, 1000);
          
        }
        if (req.url.includes("/records")) {
          end = true;
          const getIdRegex = /[0-9]+/g;
          const id = req.url.match(getIdRegex)[0];
          let {query:{start, end}} = req;
          //forçando data
          if(end - start >= 2592000000){
            //mes
          }
          else{ //dia
            start = 1654052400000
            end = 1654052400000
          }
          // 
          console.log(id);
          const database = router.db;
          const records = database.get("records").filter((rec)=> rec.date >= start && rec.date <= end && rec.userId === id ).value() || null
          setTimeout(() => {
            if(records){
              res.status(200).jsonp(records);
            } else{
              res.status(401).jsonp(null);
            }
          }, 1000);
        }
        if(!end){
          console.log('teste')
          const getIdRegex = /[0-9]+/g;
          const id = req.url.match(getIdRegex)[0];
          const database = router.db;
          const theUser = database.get("users").find((user)=> user.id === id).value() || null
          setTimeout(() => {
            if(theUser){
              res.status(200).jsonp(theUser);
            } else{
              res.status(401).jsonp(null);
            }
          }, 1000);
        }
    } else{
      if (req.url.includes("/subscription")) {
        const getIdRegex = /[0-9]+/g;
        const id = req.url.match(getIdRegex)[0];
        const database = router.db;
        const authCode = database.get("subscriptions").filter((subscription)=> subscription.id === id).value() || null
        setTimeout(() => {
          if(authCode[0]){
            res.status(200).jsonp(authCode[0]);
          } else{
            res.status(401).jsonp(null);
          }
        }, 1000);

      }
      if (req.url.includes("/paymentTypes")) {
        const getIdRegex = /[0-9]+/g;
        const id = req.url.match(getIdRegex)[0];
        console.log(id);
        const database = router.db;
        const authCode = database.get("paymentsTypes").filter((day)=> day.userId === id).value() || null
        setTimeout(() => {
          if(authCode){
            res.status(200).jsonp(authCode);
          } else{
            res.status(401).jsonp(null);
          }
        }, 1000);

      }
    }

    if (req.url.includes("/paymentMethods")) {
      console.log('chamando paymentMethods com id')
      const getIdRegex = /[0-9]+/g;
      const id = req.url.match(getIdRegex)[0];
      console.log(id);
      const database = router.db;
      const payment = database.get("paymentMethods").filter((item)=> item.id === id).value() || null

      setTimeout(() => {
        if(payment != null){
        res.status(200).jsonp(payment[0]);
      } else{
          res.status(401).jsonp(null);
        
      }
    }, 1000);
      
    }
    if(req.url.includes("/monitors")){
      const database = router.db;
      const {query} = req;
      const resp = database.get("monitors").filter((item)=> {
        let isValid = true
        Object.keys(query).forEach((key)=>{
         
          console.log(key, `${item[key]}`, query[key])
          isValid = (`${item[key]}`).includes(query[key])
        })
        return isValid;
      }).value() || null
      setTimeout(() => {
        if(resp){
          res.status(200).jsonp(resp);
        } else{
          res.status(401).jsonp(null);
        }
      }, 1000);
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
      const authUser = database.get("users").find({id: id }).value() || null
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

    if (req.url.includes("/subscription")) {
        const getIdRegex = /[0-9]+/g;
        const id = req.url.match(getIdRegex)[0];
        const database = router.db;
        const { body } = req;
        console.log(body)
        const subscription = database.get("subscriptions").find({id: id }).value() || null
        
        setTimeout(() => {
          if(subscription){
            const deviceId = `${subscription.devices.length + 1}`;
            const newSubscription = {...subscription, body}
            console.log(newSubscription)
            res.status(200).jsonp(newSubscription);
          } else{
            if(subscription){
              res.status(400).jsonp({message:'subscriptionError'});
            }
          }
        }, 1000);
      
    }

    if (req.url.includes("/monitored")) {
      const getIdRegex = /[0-9]+/g;
      const id = req.url.match(getIdRegex)[0];
      const database = router.db;
      const { body } = req;
      console.log(body)
      const monitored = database.get("monitored").find({id: id }).value() || null
      
      setTimeout(() => {
        if(monitored){
          const newmonitored = {...monitored, body}
          console.log(newmonitored)
          res.status(200).jsonp(newmonitored);
        } else{
          if(monitored){
            res.status(400).jsonp({message:'monitoredError'});
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
        const authUser = database.get("users").find({id: id }).value() || null
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

    if (req.url.includes("/monitored")) {
      const getIdRegex = /[0-9]+$/;
      console.log(req.url.match(getIdRegex));
      const id = req.url.match(getIdRegex)[0];
      const database = router.db;
      const { body } = req;
      const monitored = database.get("monitored").find({id: id }).value() || null
      console.log(monitored, id);
      setTimeout(() => {
        if(monitored){
        const newMonitored = {...monitored, ...body}
        // console.log(newUser)
        res.status(200).jsonp(newMonitored);
      } else{
        if(monitored){
          res.status(400).jsonp({message:'monitoredError'});
        }
      }
    }, 1000);
      
    }

    if (req.url.includes("/subscription")) {
      if (req.url.includes("/device")) {
        const getIdRegex = /[0-9]+/g;
        const id = req.url.match(getIdRegex)[0];
        const database = router.db;
        const { body } = req;
        console.log(body)
        const subscription = database.get("subscriptions").find({id: id }).value() || null
        
        setTimeout(() => {
          if(subscription){
            const deviceId = `${subscription.devices.length + 1}`;
            const newSubscription = {...subscription, devices : [...subscription.devices, { id:deviceId, name: body.deviceName}]}
            console.log(newSubscription)
            res.status(200).jsonp(newSubscription);
          } else{
            if(subscription){
              res.status(400).jsonp({message:'subscriptionError'});
            }
          }
        }, 1000);
      }
    }
  }

  if (req.method === 'DELETE'){
    if (req.url.includes("/devices")) {
      const getIdRegex = /[0-9]+/g;
      const id = req.url.match(getIdRegex)[0];
      console.log(id);
      const database = router.db;
      const authCode = database.get("devices").filter((dev)=> dev.userId === id).value() || null
      setTimeout(() => {
        if(authCode){
          res.status(200).jsonp('OK');
        } else{
          res.status(401).jsonp(null);
        }
      }, 1000);

    }
    if (req.url.includes("/subscription")) {
      const getIdRegex = /[0-9]+/g;
      const id = req.url.match(getIdRegex)[0];
      console.log(id);
      const database = router.db;
      const authCode = database.get("subscription").filter((dev)=> dev.userId === id).value() || null
      setTimeout(() => {
        if(authCode){
          res.status(200).jsonp('OK');
        } else{
          res.status(401).jsonp(null);
        }
      }, 1000);

    }

    if (req.url.includes("/monitored")) {
      const getIdRegex = /[0-9]+/g;
      const id = req.url.match(getIdRegex)[0];
      console.log(id);
      const database = router.db;
      const authCode = database.get("monitored").filter((dev)=> dev.userId === id).value() || null
      setTimeout(() => {
        if(authCode){
          res.status(200).jsonp('OK');
        } else{
          res.status(401).jsonp(null);
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
