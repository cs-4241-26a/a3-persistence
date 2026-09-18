require( 'dotenv' ).config()
const uri = process.env.MONGODB_URI
console.log(uri)
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb")
const mongoConnection = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });

// Problems from the Database
const mathDb = mongoConnection.db('math-app')
const problemSet = mathDb.collection('problems')
let randProblem = problemSet.aggregate([{$sample: { size:1}}])

async function BRO_PLEEEEESE(){
    let problemData = await randProblem.next()
    console.log(problemData.problem)

    randProblem = problemSet.aggregate([{$sample: { size:1}}])
    problemData = await randProblem.next()
    console.log(problemData)

    randProblem = problemSet.aggregate([{$sample: { size:1}}])
    problemData = await randProblem.next()
    console.log(problemData)

    randProblem = problemSet.aggregate([{$sample: { size:1}}])
    problemData = await randProblem.next()
    console.log(problemData)

    await mongoConnection.close()
}

async function getMo(){
  req = {
    body: {
      username: "mofo42",
      password: ""
    }
  }

  const players = mongoConnection.db('math-app').collection('players')
  console.log(`finding in DB: ${req.body.username}`)
  const targetPlayer = await players.findOne({username: req.body.username})
  console.log(targetPlayer)
  console.log('Attempting to Sign In: ' + targetPlayer.username)
}

getMo()