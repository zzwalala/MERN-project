const axios = require('axios')
const HttpError = require('../models/http-error')

async function getCoordsForAddress(address) {

    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?new_forward_geocoder=true&address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_APIKEY}`)
    const data = response.data
    if (!data || data.status === 'ZERO_RESULTS'){
        const error = new HttpError('Could not find location for the address', 422)
        throw error
    }
    
    const coordinates = data.results[0].geometry.location
    return coordinates
}

module.exports = getCoordsForAddress


