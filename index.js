const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 8000

app.use(express.json())
app.use(cors())


app.listen(port, () => {
    console.log(`My media server is running on `, port);
})

app.get('/', (req, res) => {
    res.send('My media server is running now')
})


const uri = `mongodb+srv://${process.env.mediaDb}:${process.env.mediaPassword}@cluster0.jf2skzr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const postCollections = client.db('myMedia').collection('posts')
    const userCollections = client.db('myMedia').collection('users')
    const commentCollections = client.db('myMedia').collection('comments')
    const updateCollections = client.db('myMedia').collection('updates')
    try {

        // post method 
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await userCollections.insertOne(user)
            res.send(result)
        })
        app.post('/posts', async (req, res) => {
            const data = req.body
            const dataPosted = await postCollections.insertOne(data)
            res.send(dataPosted)
        })
        app.post('/comments', async (req, res) => {
            const data = req.body
            const dataPosted = await commentCollections.insertOne(data)
            res.send(dataPosted)
        })

        // get method 
        app.get('/posts', async (req, res) => {
            const query = {}
            const post = await postCollections.find(query).sort({ _id: -1 }).toArray()
            res.send(post)
        })
        app.get('/myPosts', async (req, res) => {
            const email = req.query.email
            const query = { userEmail: email }
            const post = await postCollections.find(query).sort({ _id: -1 }).toArray()
            res.send(post)
        })
        app.get('/comments', async (req, res) => {
            const { id } = req.query
            const query = { postId: id }
            const comment = await commentCollections.find(query).sort({ _id: -1 }).toArray()
            res.send(comment)
        })
        app.get('/popularPosts', async (req, res) => {
            const popularPosts = await postCollections.find({}).limit(3).sort({ loveReact: -1 }).toArray()
            res.send(popularPosts)
        })


        // put method 
        app.put('/posts', async (req, res) => {
            const { id } = req.query
            const data = req.body
            const query = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateData = {
                $set: {
                    loveReact: data.countLove + 1
                }
            }
            const result = await postCollections.updateOne(query, updateData, options)
            res.send(result)
        })

        app.put('/updates', async (req, res) => {
            const email = req.query
            const data = req.body
            const query = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    email: email,
                    name: data?.name,
                    title: data?.title,
                    gmailLink: data?.gmail,
                    facebookLink: data?.facebook,
                    linkedinLink: data?.linkedin,
                    githubLink: data?.github,
                }
            }
            const result = await updateCollections.updateOne(query, updateDoc, options)
            res.send(result)
        })
    }
    catch {
        err => {
            console.log(err);
        }
    }
}
run().catch()




