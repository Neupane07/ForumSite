const express = require('express');
const router = express.Router({ mergeParams: true });

const Blogpost = require('../models/blogpost');
const Comment = require('../models/comment');

const { commentSchema } = require('../schemas');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

router.post('/', validateComment, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blogpost = await Blogpost.findById(id);
    const comment = new Comment(req.body.comment);
    blogpost.comments.push(comment);
    await comment.save();
    await blogpost.save();
    req.flash('success', 'comment added')
    res.redirect(`/posts/${id}`)
}))

router.delete('/:commentId', catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    await Blogpost.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', 'comment deleted')
    res.redirect(`/posts/${id}`)
}))

module.exports = router;