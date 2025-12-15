const cors = require('cors') ;
const express = require ('express') ;
require('dotenv').config() ;
const port = process.env.PORT || 3000 ;

const app = express() ;  // express er shobkisu app e niye ashlam 
app.use(cors()) ;
app.use(express.json()) ;



// Cluster thk copy kora code 
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aqhaj1o.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    // ******************************************************************
    const myDatabase = client.db("LifeDrop_DataBase") ;
    const userCollections = myDatabase.collection('Users_List') ;
 
    
    app.post('/users' , async(req , res) => {
      const userInfo = req.body ;
      userInfo.role = 'donor' ;
      userInfo.createdAt = new Date() ;

      const result = await userCollections.insertOne(userInfo) ;
      res.send(result) ;
    })

    app.get("/users/role/:email" , async(req , res) => {
      const {paramsEmail} = req.params.email ;
      console.log(paramsEmail) ;
      const query = {email:paramsEmail} ;
      const result = await userCollections.findOne(query) ;  // reg ekta email e ekabr e hobe so findone hbe
      res.send(result) ;
    })






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/' , (req , res) => {
    res.send('Hello , Developers. I am Nure Anha Tamanna') ;
})
app.listen(port , ()=>{
    console.log(`Server is Running on ${port}`) ;
})