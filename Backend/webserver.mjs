import Communicator from "./server.mjs"
import express from 'express'
import bodyParser from 'body-parser'
const app = express()
const port = 3000


const main = async function () {
  console.log("running init")
  const com = new Communicator()
  console.log(com)
  const success = await com.initInBackground()
  console.log("init done", success)
  const groups = com.groups
  console.log("GROUPS:", groups)

  app.use(bodyParser.json())

  // Add headers
  app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
  });

  app.get('/groups', (req, res) => {
    res.send(JSON.stringify(com.getGroups()))
  })

  app.get('/lights', (req, res) => {
    res.send(JSON.stringify(com.getLights()))
  })

  app.post('/set', (request, response) => {
    console.log("POST RECEIVED", request.body)
    const state = request.body.on
    const lights = request.body.lightIds

    console.log("lights from post", lights)

    lights.forEach(lightId =>
      com.setLight(lightId, state)
    )
    response.send("OK")
  })

  app.get('/', (req, res) => res.send('Hello World!'))

  app.listen(port, () => console.log(`Example app listening on port ${port}!`))

}

main()