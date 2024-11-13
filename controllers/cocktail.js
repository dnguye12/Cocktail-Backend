const axios = require('axios')
const cocktailRouter = require('express').Router()
const config = require("../utils/config");
const Cocktail = require('../models/cocktail')

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
        dateModified: drink.dateModified ? new Date(drink.dateModified) : null
    });
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
        if(result && result.data) {
            if(result.data.drinks) {
                const drinks = result.data.drinks
                let resDrinks = []

                for(const helperDrink of drinks) {
                    try {
                        const helperResult = await Cocktail.findById(helperDrink.idDrink)
                        if(!helperResult) {
                            const helperSavedDrink = parseNewDrink(helperDrink)
                            await helperSavedDrink.save()
                            resDrinks.push(helperSavedDrink)
                        }else {
                            resDrinks.push(helperResult)
                        }
                    }catch(error) {
                        console.log(error)
                    }
                }
                res.json(resDrinks)
            }else {
                return handleErrorResponse(res, 403, 'No drink for this input text.');
            }
        }
    }catch(error) {
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
                    return res.json(savedCocktail)
                } catch (error) {
                    console.log(error)
                }


                res.json(result.data.drinks)
            }
        }
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, 500, 'Database Error.');
    }
})



module.exports = cocktailRouter