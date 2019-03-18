const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const imdb = require("./imdb");
const DENZEL_IMDB_ID = "nm0000243";
let collection, database;

const CONNECTION_URL = "mongodb+srv://cocob12:123@cluster0-zkvlx.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Dataset";
var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.listen(9292, () => {

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
            console.log(`Connected to ${DATABASE_NAME} `);
        }
    );
});

app.get("/movies/populate", async (request, response) => {

    const movies = await imdb(DENZEL_IMDB_ID);
    collection.insertMany(movies, (err, result) => {
        if (err)
        {
            return response.status(500).send(err);

        }

        response.send(`Total movies added : ${movies.length}`);

    });

});

app.get("/movies", (request, response) => {

    collection
        .aggregate([
            { $match: { metascore: { $gte: 70 } } },

            { $sample: { size: 1 } }

        ])

        .toArray((error, result) => {

            if (error)
            {
                return response.status(500).send(error);
            }

            response.send(result);
        });
});


app.get("/movies/search", (request, response) => {

    console.log(request.query.limit);
    collection.aggregate([

            {
                $match: { metascore: { $gte: Number(request.query.metascore) } }
            },

            { $sample: { size: Number(request.query.limit) } }

            ])

        .toArray((error, result) => {

            if (error)
            {
                return response.status(500).send(error);
            }
            response.send(result);
        });

});

    app.get("/movies/:id", (request, response) => {
        collection.findOne({ id: request.params.id }, (err, result) => {
            if (err) {
                return response.status(500).send(err);

            }
            response.send(result);
        });
    });

app.post("/movies/:id", (request, response) => {
    let selector = {
        "id": request.params.id
    };
    let document = {
        $set: {date : request.body.date, review : request.body.review}
    };
    let options = {
        "upsert": true
    };
    collection.updateMany(selector, document, options, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send(result)
    })
})


