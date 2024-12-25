const ratingRouter = require('express').Router()

const Rating = require('../models/rating')
const Cocktail = require('../models/cocktail')
const cocktail = require('../models/cocktail')

ratingRouter.get('', async (req, res) => {
    const { id } = req.query

    if (!id) {
        return res.status(400).json('Error no rating id input')
    }

    try {
        const rating = await Rating.findById(id)
        if (rating) {
            return res.status(200).json(rating)
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal error')
    }
})

ratingRouter.post('', async (req, res) => {
    const { user, cocktail, stars, comment } = req.body

    const newRating = new Rating({
        user,
        cocktail,
        stars,
        comment
    })

    try {
        const savedRating = await newRating.save()

        const helperCocktail = await Cocktail.findById(cocktail)
        helperCocktail.ratings.push(savedRating._id)

        await helperCocktail.save()

        const returnRating = await Rating.findById(savedRating._id).populate({path: "user"})

        return res.status(201).json(returnRating )
    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal error')
    }
})

ratingRouter.get('/by-cocktail', async (req, res) => {
    const { cocktailId } = req.query

    if (!cocktailId) {
        return res.status(400).json('Error no cocktail id input')
    }

    try {
        const cocktail = await Cocktail.findById(cocktailId).populate({ path: 'ratings', populate: { path: 'user' } })
        if (!cocktail) {
            return res.status(404).json('No cocktail found')
        }

        return res.status(200).json(cocktail)

    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal error')
    }
})

module.exports = ratingRouter