const mongoose = require('mongoose');
const Comment = require('./comment')
const Schema = mongoose.Schema;

const blogpostSchema = new Schema({
    title: String,
    body: String,
    image: String,
    author: String,
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
})

blogpostSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

module.exports = mongoose.model('Blogpost', blogpostSchema)