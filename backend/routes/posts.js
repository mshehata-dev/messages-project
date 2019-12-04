const express = require('express');
const Post = require('../models/post');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

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

router.post('', checkAuth, multer({storage: storage }).single('image'), (req, res) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    });
    // console.log(req);
    // return res.status(200).json({});
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
    .catch(err => {
        res.status(500).json({
            message: 'Creating a post failed!'
        })
    })
});

router.get('', (req, res) => {
    // console.log(req.query);
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if (pageSize && currentPage) {
        postQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize); 
    }
    postQuery
        .then(docs => {
            fetchedPosts = docs;
            return Post.countDocuments();            
        })
        .then(count => {
            res.status(200).json({
                message: 'posts fetched succefully',
                posts: fetchedPosts,
                maxPosts: count
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

router.put('/:id', checkAuth, multer({storage: storage }).single('image'), (req, res) => {
    let imagePath = req.body.imagePath;
    if(req.file) {
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename;
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    });
    Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then(result => {
        // console.log(result);
        if (result.nModified > 0) {
            res.status(200).json({message: 'Post updated!'})
        } else {
            res.status(401).json({message: 'Not Authorized!'})
        }
    })
})

router.delete('/:id', checkAuth, (req, res) => {
    Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(result => {
        console.log(result)
        if (result.n > 0) {
            res.status(200).json({message: 'Post deleted!'})
        } else {
            res.status(401).json({message: 'Not Authorized!'})
        }
    })
})

module.exports = router;