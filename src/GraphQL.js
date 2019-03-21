const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const MongoClient = require("mongodb").MongoClient;
const imdb = require('./imdb');
const DENZEL_IMDB_ID = 'nm0000243';
let collection, database;

const CONNECTION_URL = "mongodb+srv://cocob12:123@cluster0-zkvlx.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Dataset";

const port = 9292;



const schema = buildSchema(`

  type Query {
    populate: Populate
    random: Movie
    getMovie(id: String) : Movie
    getMovies(metascore: Int, limit: Int): [Movie]
  },
  type Movie {
    link: String
    id: String
    metascore: Int
    poster: String
    rating: Float
    synopsis: String
    title: String
    votes: Float
    year: Int
    date: String
    review: String
  },
  type Populate{
    total: String
  },
  type Mutation{
    updateMovie(id: String, date: String, review: String) : Movie
  }
`);

//async functions for get and post requests
const root = {
    populate: async (source, args) => {
        const movies = await populate(DENZEL_IMDB_ID);
        const insertion = await collection.insertMany(movies);
        return {
            total: insertion.movie.n
        };
    },
    random: async () => {
        let options = {
            "limit": 1,
            "skip": Math.floor(Math.random() * await collection.countDocuments({"metascore": {$gte: 70}}))
        }
        return await collection.findOne({"metascore":{$gte: 70}}, options);
    },
    getMovie: async (args) => {
        return await collection.findOne({"id": args.id})
    },
    getMovies: async (args) => {
        let options = {
            "limit": args.limit,
            "sort": [
                ['metascore', 'desc']
            ]
        };
        return await collection.find({"metascore": {$gte: args.metascore}}, options).toArray();
    },
    updateMovie: async (args) => {
        const post =  await collection.updateMany({"id": args.id}, {$set: {review: args.review, date: args.date}}, {"upsert": true});
        return await collection.findOne({"id": args.id});
    }
};

async function populate(actor) {
    try {
        console.log(`Filmography of ${actor}...`);
        return await imdb(actor);
    } catch (e) {
        console.error(e);
    }
}

let app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));


app.listen(port, () => {

    MongoClient.connect(
        CONNECTION_URL,
        { useNewUrlParser: true },
        (error, client) => {
            if (error)
            {
                throw error;
            }
            database = client.db(DATABASE_NAME);
            collection = database.collection("movies");
            console.log(`Connected to ${DATABASE_NAME}`);
        }
    );
});

