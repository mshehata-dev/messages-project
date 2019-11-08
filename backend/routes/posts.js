const express = require('express');
const Post = require('../models/post');
const multer = require('multer');

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('invalid mime type');
        if(isValid) {
            error = null;
        }
        cb(error, 'backend/images')
    },
    filename: (req,file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-'); 
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, `${name}-${Date.now()}.${ext}`);
    }
})

router.post('', multer({storage: storage }).single('image'), (req, res) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename
    });
    post.save().then(createdPost => {
        res.status(201).json({
            message: 'post created successfully!',
            post: {
                id: createdPost._id,
                title: createdPost.title,
                content: createdPost.content,
                imagePath: createdPost.imagePath
            } 
        })
    })
});

router.get('', (req, res) => {
    Post.find()
        .then(docs => {
            // console.log(docs);
            res.status(200).json({
                message: 'posts fetched succefully',
                posts: docs
            })
        });
});

router.get('/:id', (req, res) => {
    Post.findById(req.params.id).then(post => {
        if (post) {
            res.status(200).json(post)
        } else {
            res.status(404).json({message: 'Post Not Found!'})
        }
    })
})

router.put('/:id', multer({storage: storage }).single('image'), (req, res) => {
    let imagePath = req.body.imagePath;
    if(req.file) {
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename;
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath 
    });
    Post.updateOne({_id: req.params.id}, post).then(() => {
        // console.log(result);
        res.status(200).json({message: 'Post updated!'})
    })
})

router.delete('/:id', (req, res) => {
    Post.deleteOne({_id: req.params.id}).then(() => {
        res.status(200).json({message: 'Post deleted!'});
    })
})

module.exports = router;