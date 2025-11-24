const express = require('express')
const cors = require('cors');
require('dotenv').config()
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const uri = process.env.DB_URI;
// mdl
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const run = async () => {
    try {
        // await client.connect();
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        const database = client.db("prodexa");
        const productsCollection = database.collection('products');
        app.post('/products', async (req, res) => {
            try {
                const product = req.body;
                const result = await productsCollection.insertOne(product)
                res.status(200).json({ success: true, result })
            } catch (error) {
                res.status(400).json({ message: error.message })
            }
        })
        app.get('/products', async (req, res) => {
            const { email } = req.query
            try {
                const filter = {}
                if (email) {
                    filter.ownerEmail = email
                }
                const result = await productsCollection.find(filter).toArray()
                res.status(200).json({ success: true, products: result })
            } catch (error) {
                res.status(400).json({ message: error.message })
            }
        })
        app.get('/latest', async (req, res) => {
            try {
                const result = await productsCollection.find().sort({ date: -1 }).limit(6).toArray()
                res.status(200).json({ success: true, products: result })
            } catch (error) {
                res.status(400).json({ message: error.message })
            }
        })
        app.get('/products/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const filter = { _id: new ObjectId(id) }
                const result = await productsCollection.findOne(filter)
                res.status(200).json(result)
            } catch (error) {
                res.status(400).json({ message: error.message })
            }
        })
        app.delete('/products/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const filter = { _id: new ObjectId(id) }
                const result = await productsCollection.deleteOne(filter)
                res.status(200).json({ success: true, result })
            } catch (error) {
                res.status(400).json({ message: error.message })
            }
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
