const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const UserSchema = new mongoose.Schema({
    _id: String,
    name: String,
    imageUrl: String,
    email: String,
    favorites: [
        {
            type: Number,
            ref: 'Cocktail'
        }
    ]
})

UserSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

UserSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', UserSchema)