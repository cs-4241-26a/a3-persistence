const express = require('express'), 
      app = express()

const session = require('express-session')
const  port = process.env.PORT || 3000

app.use(express.static('public'))
app.use(express.json())

app.use(session({
  secret: 'zodiaz-secret', 
  resave: false, 
  saveUninitialized: false
}))


const getZodiacSign = function(Birthday){
  const date = new Date(Birthday)

  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  if((month === 3 && day >= 21 ) || (month === 4 && day <= 19)){
     return {sign:'Aries', image: '♈️'}
     
} else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)){
  return {sign: 'Taurus', image:'♉️'}
} else if((month === 5 && day >= 21) || (month === 6 && day <= 20)){
  return{sign: 'Gemini', image: '♊️'}
} else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)){
  return{sign: 'Cancer', image: '♋️'}
} else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)){
  return{sign: 'Leo', image: '♌️'}
} else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)){
  return{sign: 'Virgo', image:'♍️'}
} else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)){
  return{sign: 'Libra', image: '♎️'}
} else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)){
  return{sign: 'Scorpio', image:'♏️'}
} else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)){
  return{sign: 'Sagittarius', image: '♐️'}
} else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)){
  return{sign: 'Capricorn', image:'♑️'}
} else if ((month === 1 && day >= 20) || (month === 2 && day <= 19)){
  return{sign: 'Aquarius', image: '♒️'}
}else {
  return{sign: 'Pisces', image: '♓️'}
}
}

app.post('/api/signup', async function(request, response){

  const userName = request.body.userName
  const password = request.body.password

  console.log("SIGNUP USERNAME:", userName)
  console.log("SIGNUP REQUEST RECEIVED")

  const newUser = {
    userName: userName,
    password: password
  }

  const result = await users.insertOne(newUser)

  console.log("NEW USER ID:", result.insertedId)

  const savedUser = await users.findOne({
    _id: result.insertedId
  })

  console.log("USER SAVED IN USERS:", savedUser)

  request.session.userName = userName

  response.json({
    message: "Account Created Successfully!"
  })
})

app.post('/api/login', async function(request, response){
  const userName = request.body.userName
  const password = request.body.password

  const user = await users.findOne({
    userName : userName, 
  })

  if (user) {
    request.session.userName = userName
    response.json({
      message: "Login successful!"
    })
  } else {
    response.status(401).json({
      message: "Incorrect username or password."
    })
  }
})


app.post('/api/zodiac', async function(request, response){
  const incomingData= request.body 
  console.log(incomingData)
  console.log("Logged in user:", request.session.userName)

  if(!request.session.userName){
      return response.status(401).json({
        message: "You must be logged in."
      })
    }

  const zodiac = getZodiacSign(incomingData.birthday)

    const newPerson = {
      userName : request.session.userName,
      firstName : incomingData.firstName, 
      lastName : incomingData.lastName, 
      birthday : incomingData.birthday, 
      zodiacSign: zodiac.sign,
      zodiacImage: zodiac.image
    }
      await people.insertOne(newPerson)
      response.json(newPerson)
      })
  
  app.get('/api/zodiac', async function(request, response){

  console.log("GET ZODIAC USER:", request.session.userName)

  if (!request.session.userName) {
    return response.status(401).json({
      message: "You must be logged in."
    })
  }

  const userPeople = await people.find({
    userName: request.session.userName
  }).toArray()

  console.log("USER RECORDS:", userPeople)

  response.json(userPeople)
})

app.listen(port, function() {
  console.log("Server runnning on port ${port}")
})

app.put('/api/zodiac/:id', async function(request, response){

  if (!request.session.userName) {
    return response.status(401).json({
      message: "You must be logged in."
    })
  }

  const id = request.params.id
  const newBirthday = request.body.birthday

  const zodiac = getZodiacSign(newBirthday)

  const result = await people.updateOne(
    {
      _id: new ObjectId(id),
      userName: request.session.userName
    },
    {
      $set: {
        birthday: newBirthday,
        zodiacSign: zodiac.sign,
        zodiacImage: zodiac.image
      }
    }
  )

  if (result.matchedCount === 0) {
    return response.status(404).json({
      message: "Record not found."
    })
  }

  response.json({
    message: "Record updated successfully."
  })
})
app.delete('/api/zodiac/:id', async function(request, response){

  if (!request.session.userName) {
    return response.status(401).json({
      message: "You must be logged in."
    })
  }

  const id = request.params.id

  const result = await people.deleteOne({
    _id: new ObjectId(id),
    userName: request.session.userName
  })

  response.json({
    message: "Record deleted successfully!",
    result: result
  })
})

require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}`
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const db = client.db("ZodiacApp");
const people = db.collection("people");
const users = db.collection("users");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }catch (error){
    console.error(error);
  }

}
run().catch(console.dir);

