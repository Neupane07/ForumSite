const Joi = require('joi');

//post form validation
module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().trim().required(),
        body: Joi.string().trim().required(),
        image: Joi.string().trim().required(),
        author: Joi.string().trim().required()
    }).required()
})

//comment form validation
module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().trim().required()
    }).required()
})