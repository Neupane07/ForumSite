const Joi = require('joi');

module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().trim().required(),
        body: Joi.string().trim().required(),
        image: Joi.string().trim().required(),
        author: Joi.string().trim().required()
    }).required()
})