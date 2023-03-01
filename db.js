const { MongoClient } = require('mongodb');
let dbConnection;
module.exports = {
    //first we establish a connection to the db
    connectToDb: (cb) => {
        MongoClient.connect('mongodb://127.0.0.1:27017/bookstore')
            .then((client) => {
                dbConnection = client.db()
                return cb();
            })
            .catch(err =>{
                console.log(err);
                return cb(err);
            })
    },

    //then we return that connection to the db using 
    getDb: () => dbConnection
}