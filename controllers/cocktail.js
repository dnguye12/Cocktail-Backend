const axios = require('axios')
const cocktailRouter = require('express').Router()
const config = require("../utils/config");

const Cocktail = require('../models/cocktail')
const Ingredient = require('../models/ingredient');

const handleErrorResponse = (res, statusCode, message, details = null) => {
    console.error(details || message); // Log detailed error if provided
    return res.status(statusCode).json({ error: message });
};

const parseNewDrink = (drink) => {
    return new Cocktail({
        _id: parseInt(drink.idDrink),
        name: drink.strDrink,
        category: drink.strCategory,
        IBA: drink.strIBA,
        isAlcoholic: drink.strAlcoholic === "Alcoholic",
        glass: drink.strGlass,
        strInstructions: drink.strInstructions,
        strInstructionsES: drink.strInstructionsES,
        strInstructionsDE: drink.strInstructionsDE,
        strInstructionsFR: drink.strInstructionsFR,
        strInstructionsIT: drink.strInstructionsIT,
        strInstructionsZH_HANS: drink.strInstructionsZH_HANS,
        strInstructionsZH_HANT: drink.strInstructionsZH_HANT,
        strDrinkThumb: drink.strDrinkThumb,
        ingredients: [
            { ingredient: drink.strIngredient1, measure: drink.strMeasure1 },
            { ingredient: drink.strIngredient2, measure: drink.strMeasure2 },
            { ingredient: drink.strIngredient3, measure: drink.strMeasure3 },
            { ingredient: drink.strIngredient4, measure: drink.strMeasure4 },
            { ingredient: drink.strIngredient5, measure: drink.strMeasure5 },
            { ingredient: drink.strIngredient6, measure: drink.strMeasure6 },
            { ingredient: drink.strIngredient7, measure: drink.strMeasure7 },
            { ingredient: drink.strIngredient8, measure: drink.strMeasure8 },
            { ingredient: drink.strIngredient9, measure: drink.strMeasure9 },
            { ingredient: drink.strIngredient10, measure: drink.strMeasure10 },
            { ingredient: drink.strIngredient11, measure: drink.strMeasure11 },
            { ingredient: drink.strIngredient12, measure: drink.strMeasure12 },
            { ingredient: drink.strIngredient13, measure: drink.strMeasure13 },
            { ingredient: drink.strIngredient14, measure: drink.strMeasure14 },
            { ingredient: drink.strIngredient15, measure: drink.strMeasure15 }
        ].filter(item => item.ingredient), // Filter out null ingredients
        dateModified: drink.dateModified ? new Date(drink.dateModified) : null,
        likes: 0,
        dislikes: 0
    });
}

const parseNewIngredient = (ingredient) => {
    return new Ingredient({
        _id: Number(ingredient.idIngredient),
        name: ingredient.strIngredient,
        description: ingredient.strDescription,
        type: ingredient.strType,
        isAlcohol: ingredient.strAlcohol === "Yes",
        abv: Number(ingredient.strABV)
    })
}

cocktailRouter.get('/id', async (req, res) => {
    const { id } = req.query;

    if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
        return handleErrorResponse(res, 400, 'ID input is not a valid integer.');
    }

    try {
        const result = await Cocktail.findById(id)
        if (result) {
            return res.json(result)
        }
    } catch (error) {
        console.log(error)
    }

    try {
        const result = await axios.get(`${config.COCKTAIL_API}lookup.php?i=${id}`)
        if (result && result.data) {
            if (result.data.drinks) {
                const drink = result.data.drinks[0]
                const newCocktail = parseNewDrink(drink)

                try {
                    const savedCocktail = await newCocktail.save()
                    return res.json(savedCocktail)
                } catch (error) {
                    console.log(error)
                }


                res.json(result.data.drinks)
            } else {
                return handleErrorResponse(res, 403, 'No drink for this id.');
            }
        } else {
            return handleErrorResponse(res, 500, 'Database Error.');
        }
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, 500, 'Database Error.');
    }
})

cocktailRouter.get('/name', async (req, res) => {
    const { name } = req.query

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return handleErrorResponse(res, 400, 'Name input is required and must be a valid string.');
    }

    const words = name.trim().split(/\s+/);
    const regexPattern = words.map(word => `(?=.*${word})`).join('');
    const regex = new RegExp(regexPattern, 'i');

    try {
        const result = await Cocktail.find({
            name: regex
        })
        if (result.length > 0) {
            return res.json(result)
        }
    } catch (error) {
        console.log(error)
    }

    try {
        const result = await axios.get(`${config.COCKTAIL_API}search.php?s=${name}`)
        if (result && result.data) {
            if (result.data.drinks) {
                const drinks = result.data.drinks
                let resDrinks = []

                for (const helperDrink of drinks) {
                    try {
                        const helperResult = await Cocktail.findById(helperDrink.idDrink)
                        if (!helperResult) {
                            const helperSavedDrink = parseNewDrink(helperDrink)
                            await helperSavedDrink.save()
                            resDrinks.push(helperSavedDrink)
                        } else {
                            resDrinks.push(helperResult)
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }
                res.json(resDrinks)
            } else {
                return handleErrorResponse(res, 403, 'No drink for this input text.');
            }
        }
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, 500, 'Database Error.');
    }
})

cocktailRouter.get('/random', async (req, res) => {
    try {
        const result = await axios.get(`${config.COCKTAIL_API}random.php`)

        if (result && result.data) {
            if (result.data.drinks) {
                const drink = result.data.drinks[0]
                const newCocktail = parseNewDrink(drink)

                try {
                    const savedCocktail = await newCocktail.save()
                    return res.json(newCocktail)
                } catch (error) {
                    console.log(error)
                }


                return res.json(newCocktail)
            }
        }
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, 500, 'Database Error.');
    }
})

cocktailRouter.get('/ingredient', async (req, res) => {
    const { name } = req.query

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return handleErrorResponse(res, 400, 'Name input is required and must be a valid string.');
    }

    try {
        const result = await axios.get(`${config.COCKTAIL_API}search.php?i=${name}`)
        if (result && result.data) {
            if (result.data.ingredients) {
                const resultI = result.data.ingredients[0]

                try {
                    const foundI = await Ingredient.findById(Number(resultI.idIngredient))
                    if (foundI) {
                        return res.json(foundI)
                    } else {
                        const newI = parseNewIngredient(resultI)
                        await newI.save()
                        return res.json(newI)
                    }
                } catch (error) {
                    console.log(error)
                }
            } else {
                return handleErrorResponse(res, 403, 'No ingredients for this input text.');
            }
        }

    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, 500, 'Database Error.');
    }
})

cocktailRouter.put('/updateRating', async (req, res) => {
    const { id } = req.query
    const { likes, dislikes } = req.body

    if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
        return handleErrorResponse(res, 400, 'ID input is not a valid integer.');
    }

    if (
        (likes !== undefined && (isNaN(likes) || !Number.isInteger(Number(likes)) || likes < 0)) ||
        (dislikes !== undefined && (isNaN(dislikes) || !Number.isInteger(Number(dislikes)) || dislikes < 0))
    ) {
        return handleErrorResponse(res, 400, 'Likes and dislikes must be non-negative integers.');
    }

    try {
        const updatedCocktail = await Cocktail.findByIdAndUpdate(
            id,
            {
                ...(likes !== undefined && { likes }),
                ...(dislikes !== undefined && { dislikes })
            },
            { new: true, runValidators: true } // `new` returns the updated document
        );

        if (!updatedCocktail) {
            return handleErrorResponse(res, 404, 'Cocktail not found.');
        }

        return res.json(updatedCocktail);
    } catch (error) {
        console.error(error);
        return handleErrorResponse(res, 500, 'Database Error.', error.message);
    }
})

cocktailRouter.get('/lowest-rated', async (req, res) => {
    try {
        const lowestRatedCocktails = await Cocktail.aggregate([
            { $match: { ratings: { $exists: true, $ne: [] } } },
            {
                $addFields: {
                    averageRating: {
                        $avg: "$ratings.stars"
                    }
                }
            },
            { $sort: { averageRating: 1 } },
            { $limit: 4 }
        ])
        const populatedCocktails = await Cocktail.populate(lowestRatedCocktails, {path: 'ratings'})
        return res.status(200).json(populatedCocktails.reverse())
    } catch (error) {
        console.error(error);
        return handleErrorResponse(res, 500, 'Database Error.', error.message);
    }
})

cocktailRouter.get('/highest-rated', async (req, res) => {
    try {
        const highestRatedCocktails = await Cocktail.aggregate([
            { $match: { ratings: { $exists: true, $ne: [] } } },
            {
                $addFields: {
                    averageRating: {
                        $avg: "$ratings.stars"
                    }
                }
            },
            { $sort: { averageRating: -1 } },
            { $limit: 4 }
        ])

        const populatedCocktails = await Cocktail.populate(highestRatedCocktails, {path: 'ratings'})
        return res.status(200).json(populatedCocktails.reverse())
    } catch (error) {
        console.error(error);
        return handleErrorResponse(res, 500, 'Database Error.', error.message);
    }
})

cocktailRouter.get('/popular', async (req, res) => {
    try {
        const popularCocktails = await Cocktail.find({ ratings: { $exists: true, $ne: [] } })
            .sort({ 'ratings.length': -1 })
            .limit(4)
            .populate({path: "ratings"})
        return res.status(200).json(popularCocktails.reverse());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = cocktailRouter