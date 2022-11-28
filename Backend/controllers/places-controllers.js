const uuid = require('uuid/v4')
const {validationResult} = require('express-validator')
const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')
const { default: mongoose } = require('mongoose')
const fs = require('fs')


const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid
    let place
    try{
    place = await Place.findById(placeId)
    } catch(err){
        const error = new HttpError('Could not find a place.', 500)
        return next(error)
    }
    if (!place){
        const error = new HttpError('Could not find a place for the provided id', 404)
        return next(error)
    }
    res.json({place: place.toObject({getters: true})})
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid
    let places
    try{
    places = await User.findById(userId).populate('places')
    } catch(err){
        const error = new HttpError('Could not find a place.', 500)
        return next(error)
    }
    if (!places || places.places.length === 0){
        return next(new HttpError('Could not find a place for the provided user id', 404))  
      }
    res.json({places: places.places.map(place => place.toObject({getters: true}))})
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return console.log(errors)
        next( new HttpError('Invalid input', 422))
    }
    const {title, description, address} = req.body
    let coordinates
    try{
        coordinates = await getCoordsForAddress(address)
    } catch (error) {
        return next(error)
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image:req.file.path,
        creator: req.userData.userId
    })

    let user

    try{
        user = await User.findById(req.userData.userId)
    } catch(err){
        const error = new HttpError('Creating place errored, Cannot find the creator', 500)
        return next(error)
    }

    if (!user){
        const error = new HttpError('Cannot find the creator', 404)
        return next(error)
    }

    // console.log(user)

    try{
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await createdPlace.save({session: sess})
        user.places.push(createdPlace)
        await user.save({session:sess})
        await sess.commitTransaction()
    } catch (err) {
        const error = new HttpError('Creating place failed', 500)
        return next(error)
    }

    res.status(201).json({place: createdPlace})
} 

const updatePlaceById  = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        console.log(errors)
        const error =  new HttpError('Invalid input', 422)
        return next(error)
    }
    const {title, description} = req.body
    const placeId = req.params.pid
    let place;
    try{
        place = await Place.findById(placeId)
        } catch(err){
            const error = new HttpError('Could not update a place.', 500)
            return next(error)
        }
        // console.log(place.creator.toString(), req.userData.userId);
    if (place.creator.toString() !== req.userData.userId){
        const error = new HttpError('You are not allowed to do this', 401)
        return next(error)
    }
    place.title = title
    place.description = description

    try{
        await place.save()
    } catch(err) {
        const error = new HttpError('Could not update a place', 500)
        return next(error)
    }

    res.status(200).json({place: place.toObject({getters: true})})
}

const deletePlace  = async (req, res, next) => {
    const placeId = req.params.pid
    let place
    
    try{
        place = await Place.findById(placeId).populate('creator')
        } catch(err){
            const error = new HttpError('Could not find the place to delete.', 500)
            return next(error)
        }

    if (!place){
        const error = new HttpError('Could not find the place for this id', 404)
        return next(error)
    }
    // console.log(place.creator.id, req.userData.userId);
    if (place.creator.id !== req.userData.userId){
        
        const error = new HttpError('You are not allowed to do this', 401)
        return next(error)
    }
    
    const imagePath = place.image
    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await place.remove({session: sess})
        place.creator.places.pull(place)
        await place.creator.save({session: sess})
        await sess.commitTransaction()
        
    } catch(err){
        const error = new HttpError('Could not find the place to delete.', 500)
        return next(error)
    }

    

    fs.unlink(imagePath, err=>{console.log(err);})
    res.status(200).json({message: 'place deleted'})
}


exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.deletePlace = deletePlace
exports.updatePlaceById = updatePlaceById