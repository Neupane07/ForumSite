const express = require('express');
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const { postSchema, commentSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Blogpost = require('./models/blogpost')
const Comment = require('./models/comment')
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/jhanjeri-forum', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Database connected");
})


const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const validatePost = (req, res, next) => {
    const { error } = postSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

//Routes
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/posts', catchAsync(async (req, res) => {
    const blogposts = await Blogpost.find({});
    res.render('posts/index', { blogposts })
}))

app.get('/posts/new', (req, res) => {
    res.render('posts/new');
})

app.post('/posts', validatePost, catchAsync(async (req, res) => {
    const blogpost = new Blogpost(req.body.post)
    await blogpost.save();
    res.redirect(`/posts/${blogpost._id}`)
}))

app.get('/posts/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const blogpost = await Blogpost.findById(id).populate('comments');
    const comments = blogpost.comments;
    res.render('posts/show', { blogpost, comments })
}))

app.get('/posts/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const blogpost = await Blogpost.findById(id);
    res.render('posts/edit', { blogpost });

}))

app.put('/posts/:id', validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blogpost = await Blogpost.findByIdAndUpdate(id, { ...req.body.post })
    res.redirect(`/posts/${id}`)
}))

app.delete('/posts/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const oldpost = await Blogpost.findByIdAndDelete(id);
    res.redirect('/posts');
}))

app.post('/posts/:id/comments', validateComment, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blogpost = await Blogpost.findById(id);
    const comment = new Comment(req.body.comment);
    blogpost.comments.push(comment);
    await comment.save();
    await blogpost.save();
    res.redirect(`/posts/${id}`)
}))

app.delete('/posts/:id/comments/:commentId', catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    await Blogpost.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/posts/${id}`)
}))

app.all('*', (req, res) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'OH NO! Something went wrong!';
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('App listening on port 3000!')
})
