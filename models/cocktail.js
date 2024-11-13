const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const CocktailSchema = new mongoose.Schema({
    _id: {
        type: Number,
    },
    name: {
        type: String,
        required: true,
        index: true,
    },
    category: {
        type: String,
        index: true
    },
    IBA: String,
    isAlcoholic: {
        type: Boolean,
        index: true
    },
    glass: {
        type: String,
        index: true
    },
    strInstructions: String,
    strInstructionsES: String,
    strInstructionsDE: String,
    strInstructionsFR: String,
    strInstructionsIT: String,
    strInstructionsZH_HANS: String,
    strInstructionsZH_HANT: String,
    strDrinkThumb: String,
    ingredients: [
        {
            ingredient: {
                type: String,
                index: true
            },
            measure: String
        }
    ],
    dateModified: {
        type: Date,
        index: true
    }
})

CocktailSchema.plugin(uniqueValidator);

CocktailSchema.index({ 
    name: 1,
    category: 1,
    isAlcoholic: 1
})

CocktailSchema.index({ name: 'text', category: 'text', glass: 'text' });

CocktailSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Cocktail', CocktailSchema)