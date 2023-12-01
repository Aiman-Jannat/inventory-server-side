const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


//middleware

app.use(express.json());
app.use(cors());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tzvbxiw.mongodb.net/?retryWrites=true&w=majority`;

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
    
    const db = client.db("inventoryManagement");
    const userCollection = db.collection("users")
    const shopCollection = db.collection("shop");
    const productsCollection = db.collection("product");
    const checkoutCollection = db.collection("checkOut");

    ///to post user

    app.get('/',(req,res)=>{
        res.send("inventory is runnning")
    })
    app.post('/products', async (req, res) => {
        const user = req.body;
        const result = await productsCollection.insertOne(user);
        res.send(result);
      })

     
    app.post('/users', async (req, res) => {
        const user = req.body;
        // console.log("user",user)
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        // console.log(existingUser);
        if (existingUser) {
          return res.send({ message: "user already exist", insertedId: null })
        }
    
        const result = await userCollection.insertOne(user);
        res.send(result);
      })


       // added a shop

      app.post('/shop',async(req,res)=>{
        const item = req.body;
        const productLimit = 3;
        item.productLimit = productLimit;
          const result = await shopCollection.insertOne(item);
        res.send(result);
      })
      app.post('/check',async(req,res)=>{
          const result = await checkoutCollection.insertOne(req.body);
        res.send(result);
      })
      app.get('/check', async (req, res) => {
        const user = await checkoutCollection.find().toArray();
         res.send(user)
  
  
      })
      app.put('/shop', async (req, res) => {
        const updatedShop= req.body;
    console.log("email",updatedShop.productLimit);
        const filter = {
            ownerEmail: updatedShop.email
        };
        const options={
            upsert:true
          }
          const updatedUser={
            $set:{
              
              productLimit:updatedShop.productLimit
              
      
            }
          }
        const result = await shopCollection.updateOne(filter,updatedUser);
        res.send(result);
      })
       app.put('/products/selling/:id', async (req, res) => {
        const id = req.params.id;
        const updatedShop= req.body;
    console.log("updated")
        const filter = {
            _id: new ObjectId(id)
        };
        const options={
            upsert:true
          }
          const updatedUser={
            $set:{
              
              saleCount:updatedShop.newSale,
              productQuantity:updatedShop.newQuantity
              
      
            }
          }
        const result = await productsCollection.updateOne(filter,updatedUser);
        res.send(result);
      })
      app.put('/products/update/:id', async (req, res) => {
        const id= req.params.id;
        const update = req.body;
    // console.log("id",id)
        const filter = {
            _id: new ObjectId(id)
        };
        const options={
            upsert:true
          }
          const updatedUser={
            $set:{
                ProductName:update.ProductName,
                discount:update.discount,
                productionCost:update.productionCost,
                productLocation:update.productLocation,
                productQuantity:update.productQuantity,
                profitMargin:update.profitMargin,
                productImage:update.productImage,
                productSellingPrice:update.productSellingPrice,
                saleCount:update.saleCount
              
              
      
            }
          }
        const result = await productsCollection.updateOne(filter,updatedUser);
        res.send(result);
      })
     
      app.put('/users', async (req, res) => {
       const income = req.body;
       console.log("income",income)
        const filter = {
            role: "admin"
        };
        const options={
            upsert:true
          }
          const updatedUser={
            $set:{
               income:income.income
              
              
      
            }
          }
        const result = await userCollection.updateOne(filter,updatedUser);
        res.send(result);
      })

       // added user's role as manager

       app.patch('/users/manager/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'manager'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.get('/products/get/specific/:nid', async (req, res) => {
        const id = req.params.nid;
        //  console.log("id-",id)
        const query = { _id: new ObjectId(id)};
        const result = await productsCollection.findOne(query);
        res.send(result);
      })
    app.get('/products/specific/:id', async (req, res) => {
        const id = req.params.id;
        //  console.log("id-",id)
        const query = { _id: new ObjectId(id)};
        const result = await productsCollection.findOne(query);
        res.send(result);
      })
// 

    //to get user by email

      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
         res.send(user)
  
  
      })

      

      //get user's specific shop
      app.get('/shop/:email', async (req, res) => {
        const email = req.params.email;
        const query = { ownerEmail: email };
        const user = await shopCollection.findOne(query);
         res.send(user)
  
  
      })
      app.get('/products/:email', async (req, res) => {
        const email = req.params.email;
        // console.log("products",email)
        const query = { ownerEmail: email };
        const result = await productsCollection.find(query).toArray();
        res.send(result)
        
        
        
  
  
      })

    // 

    //   //to delete an user

      app.delete('/check', async (req, res) => {
        
        const result = await checkoutCollection.deleteMany();
        res.send(result);
      })

    //   //to get all product or user

    //   app.get('/menu', async (req, res) => {
    //     const result = await menuCollection.find().toArray();
    //     res.send(result);
    //   })

    //   //to add a product

    //   app.post('/menu',verifyToken,verifyAdmin ,async(req,res)=>{
    //     const item = req.body;
    //     const result = await menuCollection.insertOne(item);
    //     res.send(result);
    //   })

    //   //to get all products

      app.get('/users', async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
      })

    //   //to delete specific product

      app.delete('/products/delete/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.send(result);
      })
  
    


    
    
    
    
    
    
    
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);
app.listen(port, () => {
    console.log("Bistro Boss is running")
  })