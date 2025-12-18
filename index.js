const cors = require('cors') ;
const express = require ('express') ;
require('dotenv').config() ;
const port = process.env.PORT || 3000 ;

const app = express() ;  // express er shobkisu app e niye ashlam 
app.use(cors()) ;
app.use(express.json()) ;
const { ObjectId } = require('mongodb');

const admin = require("firebase-admin");

// const serviceAccount = require("./firebase-admin-key.json");
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8')
const serviceAccount = JSON.parse(decoded);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const verifyFBToken = async(req , res , next) => {
  const token = req.headers.authorization ;

  if(!token){
    return res.status(401).send({message: 'unauthorized access'})
  }

  try{
    const idToken = token.split(' ')[1] ;
    const decoded = await admin.auth().verifyIdToken(idToken) ;
    console.log('decoded info' , decoded) ;
    req.decoded_email = decoded.email ;
    next() ;
  }
  catch(error){
    return res.status(401).send({message: 'unauthorized access'}) ;
  }
}




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



    // ******************************* MY PORTION **************************************************************
    const myDatabase = client.db("LifeDrop_DataBase") ;
    const userCollections = myDatabase.collection('Users_List') ;
    const createdDonationRequestCollections = myDatabase.collection("Created_Donation_Requests");

 
    // Registered users info stored in dattabase
    app.post('/users' , async(req , res) => {
      const userInfo = req.body ;
      userInfo.role = 'donor' ;
      userInfo.status = 'active' ;
      userInfo.createdAt = new Date() ;
      const result = await userCollections.insertOne(userInfo) ;
      res.send(result) ;
    })

    app.get("/users/:email" , async(req , res) => {
      const email = req.params.email ;
      const query = {Email:email} ;
      const result = await userCollections.findOne(query) ;  // registration ekta email e ekabr e hobe so findone hbe
      res.send(result) ;
    })


    // Create Donation Request info stored in dattabase
    app.post('/created-donation-requsts' , verifyFBToken , async(req , res) => {
      const createdDonationReqInfo = req.body ;
      createdDonationReqInfo.Donation_status = 'pending' ;
      createdDonationReqInfo.createdAt = new Date() ;
      const result = await createdDonationRequestCollections.insertOne(createdDonationReqInfo) ;
      res.send(result) ;
    })


    // Latest 3 requests of logged-in user's need to shown
    app.get("/recent" , async(req , res) => {
      const userEmail = req.query.userEmail ;
      const query_Recent = {Requester_Email : userEmail}
      const result = await createdDonationRequestCollections.find(query_Recent).sort({createdAt:-1}).limit(3).toArray() ;
      res.send(result) ;
    })


    // All requests of logged-in user's need to shown
    app.get("/all-requests" , async(req , res) => {
      const userEmail = req.query.userEmail ;
      const query_Recent = {Requester_Email : userEmail}
      const result = await createdDonationRequestCollections.find(query_Recent).toArray() ;
      res.send(result) ;
    })


    // TotalDonor
    app.get('/total-donor' , async(req , res) => {
      const totalDonor = await userCollections.countDocuments({role:'donor'}) ;
      const result = {TotalDonors:totalDonor} ;
      res.send(result) ;
    })
    // total Fundings
    // app.get('/total-blood-donation-request' , async(req , res) => {
    //   const totalRequests = await createdDonationRequestCollections.countDocuments() ;
    //   const result = {TotalRequests:totalRequests} ;
    //   res.send(result) ;
    // })
    // total blood donation request 
    app.get('/total-blood-donation-request' , async(req , res) => {
      const totalRequests = await createdDonationRequestCollections.countDocuments() ;
      const result = {TotalRequests:totalRequests} ;
      res.send(result) ;
    })


    // All users(donors)
    app.get('/all-users' , async(req , res) => {
      const allUsers = await userCollections.find().toArray() ;
      const result = {All_Users : allUsers} ;
      res.send(result) ;
    })


    // Update User_Status from All Users(Admin) page
    app.patch("/update-user-status" ,verifyFBToken, async(req , res) => {
      const {myEmail , myStatus} = req.query ;
      const query = {Email:myEmail} ;

      const updateStatus = {
        $set : {status:myStatus}
      }
      const result = await userCollections.updateOne(query , updateStatus) ;
      res.send(result) ;
    })
    // Update User_Role from All Users(Admin) page
    app.patch("/update-user-role" ,verifyFBToken, async(req , res) => {
      const {myEmail , myRole} = req.query ;
      const query = {Email:myEmail} ;

      const updateRole = {
        $set : {role:myRole}
      }
      const result = await userCollections.updateOne(query , updateRole) ;
      res.send(result) ;
    })
    // Update Donation_Status from All Users(Admin) page
    app.patch("/update-donation-status" ,verifyFBToken, async(req , res) => {
      const {my_id , myDonationStatus} = req.query ;
      const query = { _id: new ObjectId(my_id) }; ;

      const updateDonationStatus = {
        $set : {Donation_status:myDonationStatus}
      }
      const result = await createdDonationRequestCollections.updateOne(query , updateDonationStatus) ;
      res.send(result) ;
    })



    // ********************************MY PORTION END****************************************************




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