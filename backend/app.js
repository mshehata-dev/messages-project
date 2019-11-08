const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');

mongoose.connect('mongodb+srv://user:O3LX6camgtqDvlO9@cluster0-febv7.mongodb.net/node-angular?retryWrites=true&w=majority',{useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => {
        console.log('Connected to database!')
    })
    .catch(() => {
        console.log('Cpnnection faild');
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/images', express.static(path.join('backend/images'))); 

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});

app.use('/api/posts', postsRoutes);

module.exports = app;