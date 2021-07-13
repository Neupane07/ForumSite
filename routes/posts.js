const express = require('express');
const router = express.Router();

const Blogpost = require('../models/blogpost');
const { postSchema } = require('../schemas');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const isLoggedIn = require('../middleware')
const validatePost = (req, res, next) => {
    const { error } = postSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const blogposts = await Blogpost.find({});
    res.render('posts/index', { blogposts })
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('posts/new');
})

router.post('/', isLoggedIn, validatePost, catchAsync(async (req, res) => {
    const blogpost = new Blogpost(req.body.post)
    await blogpost.save();
    req.flash('success', 'Sucessfully created a new post!')
    res.redirect(`/posts/${blogpost._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const blogpost = await Blogpost.findById(id).populate('comments');
    if (!blogpost) {
        req.flash('error', 'Could not find the post!')
        return res.redirect('/posts')
    }
    const comments = blogpost.comments;
    res.render('posts/show', { blogpost, comments })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blogpost = await Blogpost.findById(id);
    if (!blogpost) {
        req.flash('error', 'Could not find the post!')
        return res.redirect('/posts')
    }
    res.render('posts/edit', { blogpost });

}))

router.put('/:id', isLoggedIn, validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blogpost = await Blogpost.findByIdAndUpdate(id, { ...req.body.post })
    req.flash('success', 'Successfully updated the post')
    res.redirect(`/posts/${blogpost._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const oldpost = await Blogpost.findByIdAndDelete(id);
    res.redirect('/posts');
}))

module.exports = router;