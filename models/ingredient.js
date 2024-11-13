const mongoose = require('mongoose')

const IngredientSchema = new mongoose.Schema({
    _id: {
        type: Number
    },
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String
    },
    type: {
        type: String
    },
    isAlcohol: {
        type: Boolean
    },
    abv: {
        type: Number
    }
})

IngredientSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Ingredient', IngredientSchema)