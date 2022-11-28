const uuid = require('uuid/v4')
const HttpError = require('../models/http-error')
const { validationResult } = require("express-validator");
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const getUsers = async (req, res, next) => {
    let users
    try{
    users = await User.find({}, '-password')
    } catch(err){
        const error = new HttpError('Cannot find users', 500)
        return next(error)
    }
    res.json({users: users.map(user => user.toObject({getters:true}))})
}

const signup = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        console.log(errors)
        const error =  new HttpError('Invalid input', 422)
        return next(error)
    }

    const {name, email, password} = req.body
    let existingUser
    try{
    existingUser = await User.findOne({email: email})
    } catch (err) {
        const error = new HttpError(
            'Signing up failed', 500
        )
        return next(error)
    }
    if (existingUser) {
        const error = new HttpError(
            'User existed', 422
        )
        return next(error)
    }

    let hashedPass
    try{
    hashedPass = await bcrypt.hash(password, 12)
    }catch(err){
        const error = new HttpError('Cannot hash password', 500)
        return next(error)
    }

    const createdUser = new User({
        name,
        email,
        image:req.file.path,
        password: hashedPass,
        places: []
    })

    try{
        createdUser.save()
        } catch (err) {
            const error = new HttpError('Signing up failed', 500)
            return next(error)
        }

    let token
    try{
    token = jwt.sign({userId: createdUser.id, email: createdUser.email}, process.env.PRIVATE_KEY, {expiresIn: '1h'})
    } catch(err){
        const error = new HttpError('Signing up failed', 500)
        return next(error)
    }


    res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token})
}

const login = async (req, res, next) => {
    const {email, password} = req.body

    let existingUser
    try{
    existingUser = await User.findOne({email: email})
    } catch (err) {
        const error = new HttpError(
            'Logging in failed', 500
        )
        return next(error)
    }
    

    if (!existingUser ) {
        const error = new HttpError('Invalid Credential', 401)
        return next(error)
    }

    let isValid = false
    try{
    isValid = await bcrypt.compare(password, existingUser.password)
    } catch(err){
        const error = new HttpError('Cannot check credentials', 500)
        return next(error)
    }

    if (!isValid){
        const error = new HttpError('Wrong user and password', 401)
        return next(error)
    }

    let token
    try{
    token = jwt.sign({userId: existingUser.id, email: existingUser.email}, process.env.PRIVATE_KEY, {expiresIn: '1h'})
    } catch(err){
        const error = new HttpError('Signing up failed', 500)
        return next(error)
    }

    res.json({userId: existingUser.id, email: existingUser.email, token: token})
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login