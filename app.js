const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');

//init app and middleware
const app = express();
app.use(express.json())

const port = 8181;

//db connection
let db;
connectToDb((err) => {
    if(!err){
        app.listen(port, () => {
            console.log(`App listening at port http://localhost:${port}/`);
        });
        db = getDb();
    }
});

app.get('/books/:id', (req,res)=>{

    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
            .findOne({_id: new ObjectId(req.params.id)})
            .then(doc=>{
                res.status(200).json(doc)
            })
            .catch(err =>{
                res.status(500).json({error: 'Could not fetch docs, internal server error'})
            })
    }
    else{
        res.status(500).json({error: 'oops, internal server error!'})
    }

})

app.get('/',(req,res)=>{
    res.send('hi Mom!, Click here to see the <a href="/books">Books</a>');
})


app.get('/books', (req,res)=>{
    
    const page = req.query.p || 0;
    const booksPerPage = 2;

    const books = []
    console.log(typeof(books))
    db.collection('books') //db.books in mongodb
        .find() //returns a cursor which is an obj that points to a set of docs outlined by our query
        .sort({author: 1})
        .skip(page * booksPerPage)
        .limit(booksPerPage)
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).json(books);
        })
        .catch(()=>{
            res.status(500).json({error: 'Internal server error, could not fetch book'});
        })
})

app.post('/books',(req,res)=>{
    const book = req.body;
    db.collection('books')
        .insertOne(book)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err=>{
            res.status(500).json({error: 'Internal Server Error, Could not create new doc'})
        })
});

app.delete('/books/:id', (req,res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .deleteOne({_id: new ObjectId(req.params.id)})
            .then(result =>{
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({error: 'Internal server error, could not delete document'})
            })
    }
    else{
        res.status(500).json({error: 'Incorrect document id'})
    }
})

app.patch('/books/:id', (req,res)=>{
    const upd = req.body; //object with diff fieds we want to update

    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .updateOne({_id: new ObjectId(req.params.id)}, {$set: upd})
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({error: 'Internal server error, could not delete document'})
            })
    }
    else{
        res.status(500).json({error: 'Incorrect document id'})
    }
})

