/* eslint-disable no-undef */
require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const COCKTAIL_API = process.env.COCKTAIL_API

module.exports = {
	MONGODB_URI,
	PORT,
	COCKTAIL_API
}