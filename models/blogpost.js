const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogpostSchema = new Schema({
    title: String,
    body: String,
    image: String,
    author: String
})

module.exports = mongoose.model('Blogpost', blogpostSchema)