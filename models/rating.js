const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const RatingSchema = new mongoose.Schema({
    user: {
        type: String,
        ref: 'User'
    },
    cocktail: {
        type: Number,
        ref: 'Cocktail'
    },
    stars: {
        type: Number,
        required: true,
    },
    comment: {
        type: String
    }
}, {
    timestamps: true
})

RatingSchema.plugin(uniqueValidator);

RatingSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Rating', RatingSchema)