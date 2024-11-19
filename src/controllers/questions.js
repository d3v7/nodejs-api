const axios = require('axios');
const {MongoClient} = require('mongodb');
require('dotenv').config({path: '../.env'});


const uri = process.env.MONGO_URI;
const collectionName = process.env.MONGO_COLLECTION;
const dbName = process.env.MONGO_DB;

const client = new MongoClient(uri);

// funtcion to fetch data from api and load it to mongodb
async function fetchAndLoad(){
    try{
        const result = await axios.get('https://api.stackexchange.com/2.3/questions?site=stackoverflow')
        const data = result.data;

        await client.connect();
        console.log('Connection sucessful');

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const insert = await collection.insertOne(data);
        console.log('Data inserted sucessfully'); 
    }
    catch(err){
        console.error(err);
    } 
    finally{
        await client.close();
        console.log('Connection closed');
    }
}


exports.LoadQuestions = async (req, res) => {
    
    fetchAndLoad();
    res.send('Data fetched and loaded from api');

}
