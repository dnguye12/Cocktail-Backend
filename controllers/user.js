const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('', async (req, res) => {
    const { id } = req.query

    if (!id) {
        return res.status(400).json('Error no user id input')
    }

    try {
        const user = await User.findById(id)
        if (user) {
            return res.status(200).json(user)
        }else {
            console.log("here")
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal error')
    }
})

userRouter.post('', async (req, res) => {
    const { id, name, imageUrl, email } = req.body

    const newUser = new User({
        _id: id,
        name,
        imageUrl,
        email
    })

    try {
        const savedUser = await newUser.save()
        return res.status(201).json(savedUser)
    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal error')
    }
})

module.exports = userRouter