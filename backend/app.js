const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://user:O3LX6camgtqDvlO9@cluster0-febv7.mongodb.net/node-angular?retryWrites=true&w=majority',{useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => {
        console.log('Connected to database!')
    })
    .catch(() => {
        console.log('Cpnnection faild');
    })

const Post = require('./models/post')

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

app.post('/api/posts', (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content
    });
    post.save().then(createdPost => {
        res.status(201).json({
            message: 'post created successfully!',
            postId: createdPost._id
        })
    })
});

app.get('/api/posts', (req, res, next) => {
    Post.find()
        .then(docs => {
            console.log(docs);
            res.status(200).json({
                message: 'posts fetched succefully',
                posts: docs
            })
        });
});

app.delete('/api/posts/:id', (req, res, next) => {
    Post.deleteOne({_id: req.params.id}).then(result => {
        res.status(200).json({message: 'Post deleted!'});
    })
})

module.exports = app;