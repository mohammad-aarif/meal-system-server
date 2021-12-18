const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = 3002 || process.env.PORT;

// MiddleWare
app.use(cors())
app.use(express.json())

//Mongo Creadetials
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fwb1h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Mongo Function 
const run = async () => {
  try{
    // Database Connection 
    await client.connect()
    console.log("Database Connected!")

    // Database and Collection 
    const database = client.db('meal_system');
    const usersCollection = database.collection('users');
    const marketCollection = database.collection('market');
    const depositCollection = database.collection('deposit');
    const mealCollection = database.collection('meal');

    // Post User Data 
    app.post('/users', async(req, res) => {
      const data = req.body;
      const cursor = await usersCollection.insertOne(data)
      res.json(cursor)
    })
    // Firebase User 
    app.put('/users', async(req, res) => {
      const data = req.body;
      const result = await usersCollection.updateOne({email: data.email}, {$set: data}, {upsert: true})
      res.json(result)
    })


    // Update Total Meal on User Collection 
    app.put('/users/meal', async(req, res) => {
      const data = req.body;
      const increaseMeal = req.body.meal;
      const result = await usersCollection.updateOne({email: data.email}, { $inc: { "meal" : increaseMeal }}, {upsert: true})
      res.json(result)
    })

    // Entry All Meals 
    app.put('/meals', async(req, res) => {
      const data = req.body;
      console.log(data);
      const date = req.body.meal;
      const result = await mealCollection.updateOne({email: data.email, date: data.date }, {$set: data}, {upsert: true})
      res.json(result)
    })

    // Update Total Deposit on User Collection 
    app.put('/users/deposit', async(req, res) => {
      const data = req.body;
      const increaseMoney = req.body.money;
      const result = await usersCollection.updateOne({email: data.email}, { $inc: { "money" : increaseMoney }}, {upsert: true})
      res.json(result)
    })

    // Entry All Deposit 
    app.post('/deposit', async(req, res) => {
      const data = req.body;
      const result = await depositCollection.insertOne(data)
      res.json(result)
    })


    // Update Total Goods Cost on Network Manager
    app.put('/users/cost', async(req, res) => {
      const data = req.body;
      const increaseMoney = req.body.goodsCost;
      const result = await usersCollection.updateOne({email: data.email}, { $inc: { "goodsCost" : increaseMoney }}, {upsert: true})
      res.json(result)
    })

    // Entry All Goods Cost 
    app.post('/cost', async(req, res) => {
      const data = req.body;
      const result = await marketCollection.insertOne(data)
      res.json(result)
    })

    // Getting All User 
    app.get('/users', async(req, res) =>{
      const cursor = usersCollection.find({});
      const users = await cursor.toArray()
      res.json(users)
    })

    // Getting Meals by User 
    app.get('/meals/user/:email', async(req, res) =>{
      const email = req.params.email;
      const cursor = mealCollection.find({email: email});
      const meals = await cursor.toArray()
      res.json(meals)
    })

    // Getting Meals by Network 
    app.get('/meals/:email', async(req, res) =>{
      const email = req.params.email;
      console.log(email)
      const cursor = mealCollection.find({network: email});
      const meals = await cursor.toArray()
      res.json(meals)
    })


    // Getting Single User 
    app.get('/userdata/:email', async(req, res) =>{
      const email = req.params.email;
      const cursor = await usersCollection.findOne({email: email});
      res.send(cursor)
    })

    
    // Getting User by Network 
    app.get('/users/:email', async(req, res) =>{
      const email = req.params.email;
      console.log(email)
      const cursor = usersCollection.find({'networkInfo.network': email});
      const users = await cursor.toArray()
      res.json(users)
    })

    
    // Getting Market by Network 
    app.get('/goods/:email', async(req, res) =>{
      const email = req.params.email;
      console.log(email)
      const cursor = marketCollection.find({network : email});
      const goods = await cursor.toArray()
      res.json(goods)
    })
    // Getting User Role 
    app.get('/users/role/:email', async(req, res) => {
      const email = req.params.email;
      const query = {email: email}
      console.log(query)
      const user = await usersCollection.findOne(query)
      let role
      if(user?.networkInfo?.role === 'admin'){
        role = 'admin'
      }
      else if(user?.networkInfo?.role === 'manager'){
        role = 'manager'
      }
      res.json({role: role})
    })
  }
  finally{

  }
}
run().catch(console.dir)

// Initilization
app.get('/', (req, res) => {
  res.send('Server Running...')
})
// initialization Console
app.listen(port, () => {
  console.log("Server Running on port", port)
})