const jsonServer = require("json-server");
const constants = require("./constants");
const db = require("./db");
const server = jsonServer.create();
const router = jsonServer.router(db);
const singular = require("./singular");
const middlewares = jsonServer.defaults();
const port = 3001;

const searchExames = (query) => {
  let res = [];
  if (
    query &&
    query.campoPesquisa &&
    Number(query.campoPesquisa) !== 0 &&
    query.utilizarVolumetria == "false"
  ) {
    switch (query.campoPesquisa) {
      case "1":
        res = db.detalhe_exames.filter((exame) => {
          return exame?.idDasa === query.descricao;
        });
        break;
      case "3":
        res = db.detalhe_exames.filter(
          (exame) => exame?.codTuss === query.descricao
        );
        break;
      case "4":
        res = db.detalhe_exames.filter(
          (exame) => exame?.medinc?.id === query.descricao
        );
        break;
      case "5":
        res = db.detalhe_exames.filter(
          (exame) => exame?.codSap === query.descricao
        );
        break;
    }
  } else {
    //nome ou sinonímia

    const desc = query.descricao.toLowerCase();
    res = db.detalhe_exames.filter((exame) => {
      const nome = exame.nome.toLowerCase();
      return nome.includes(desc);
    });
    console.log(res);
    if (res.length < 1) {
      res = db.detalhe_exames.filter((exame) => {
        return exame.sinonimias.some((sino) => {
          const sinoName = sino.toLowerCase();
          sinoName.includes(desc);
        });
      });
    }
    console.log(res);
  }
  return res;
  // /exame?descricao=53456&utilizarVolumetria=false&campoPesquisa=1
};

// const insert = (db, collection, data) =>{
//   const table = db[collection];
//   server.
// }

server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use(singular);
server.use((req, res, next) => {
  if (req.method === "GET") {
    if (req.query?.descricao) {
      res.json(searchExames(req.query));
    } else if (req.url.includes("/relatorio")) {
      res.download("./data/Preparo.pdf");
    } else {
      next();
    }
  }

  // if (req.method === "POST") {
  //   if (req.url === "/v1/cadastro") {
  //     const database = router.db;
  //     const { body } = req;
  //     const total = db.detalhe_exames.length;
  //     // const clone = JSON.parse(JSON.stringify(db.detalhe_exames[1]));
  //     const data = {
  //       ...db.detalhe_exames[1],
  //       ...body,
  //       id: Number(db.detalhe_exames[total - 1].id) + 1,
  //     };
  //     database.get("detalhe_exames").push(data).write();
  //     // const getIdRegex = /[0-9]+[^\/\&]/g;
  //     // const path = req.url.replace(getIdRegex, ":id");
  //     // const id = req.url.match(getIdRegex);
  //     // // console.log(path);
  //     // // console.log(id);
  //     // Continue to JSON Server router
  //   }
  // }
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
    "/exame?descricao=:desc&utilizarVolumetria=false&campoPesquisa=:cpid":
      "/detalhe_exames",
    "/exame?descricao=:desc&utilizarVolumetria=true": "/detalhe_exames",
    "/cadastro/list-combos": "/list_combos",
    "/cadastro/:id": "/detalhe_exames",
    "/cadastro": "/detalhe_exames",
  })
);

// Use default router
server.use(router);
server.listen(port, () => {
  console.log("Mock Server is running on port " + port);
});
