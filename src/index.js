/****
    * City Biking
    * Author: Chris Buonocore

    NodeJS alexa skill for finding information on city bikes in your town.

    ## Concept
    You can ask the city biking alexa skill for information on the number of bike shares at stations across the United States.
    This alexa skill will understand fuzzy queries about particular streets and locations, and give you the number of free bikes at that location in real time.

 **/

/* eslint-disable  func-names */
/* eslint-disable  no-restricted-syntax */
/* eslint-disable  no-loop-func */
/* eslint-disable  consistent-return */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core')
const helper = require('./helper')
const api = require('./api')

const skillBuilder = Alexa.SkillBuilders.custom()

const APP_NAME = "City Biking"
const WELCOME_PROMPT = `To continue say, give me a fact, or something like 'bikes in ${helper.getRandomCity()}. `
const ERROR_MESSAGE = 'Sorry, I didn\'t understand the command. Please say again.'

const MAX_RESULTS = 4

// App States
const states = {
    NONE: "_NONE",
    GET_CITY: "_GET_CITY",
    GET_STATION: "_GET_STATION"
}

/* INTENT HANDLERS */

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(`Welcome to ${APP_NAME}, I can help you find city bikes. ${WELCOME_PROMPT}`)
            .reprompt(WELCOME_PROMPT)
            .getResponse();
    }
};


const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(`You're currently using ${APP_NAME}. ${WELCOME_PROMPT}`)
            .reprompt(WELCOME_PROMPT)
            .getResponse();
    }
};

const ExitHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.CancelIntent'
                || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Good luck on your next ride. Bye!')
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak(ERROR_MESSAGE)
            .reprompt(ERROR_MESSAGE)
            .getResponse();
    }
};

/* CUSTOM HANDLERS */

const BikeFactIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const attributes = handlerInput.attributesManager.getSessionAttributes();

        return attributes.state !== states.GET_STATION &&
            request.type === 'IntentRequest' && 
            request.intent.name === 'BikeFactIntent';
    },
    handle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes()
        attributes.state = states.NONE

        const bikeFact = helper.getBikeFact()

        return handlerInput.responseBuilder
            .speak(`Here's your bike fact: ${bikeFact}. What next? ${WELCOME_PROMPT}`)
            .reprompt(WELCOME_PROMPT)
            .getResponse();
    }
};

const CityBikeIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' && request.intent.name === 'CityBikeIntent';
    },
    async handle(handlerInput) {
        console.log('in CityBikeIntent')
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        attributes.state = states.GET_CITY;

        const item = helper.getItem(handlerInput.requestEnvelope.request.intent.slots);
        const city = item.CityName;
        const state = item.StateName;

        // console.log('city', city)
        // console.log('state', state)

        if (!city) {
            // At least city is required.
            return handlerInput.responseBuilder
                .speak(`Sorry didn\'t get that. ${WELCOME_PROMPT}`)
                .reprompt(WELCOME_PROMPT)
                .getResponse();
        }

        attributes.city = city
        try {
            const networkData = await api.getAllNetworks()

            const networks = helper.getUSNetworks(networkData.data.networks)
            const matches = helper.getNetworkMatches(city, state, networks)
            console.log('network matches', matches.length)
            if (matches && matches.length > 0) {
                attributes.state = states.GET_STATION

                const cityMatch = matches[0].location.city
                const stateMatch = matches[0].location.state
                attributes.cityMatch = cityMatch
                attributes.stateMatch = stateMatch
                const networkId = matches[0].id
                attributes.networkMatch = networkId
                try {
                    attributes.networkId = networkId
                    const stationData = await api.getNetwork(networkId)
                    const stations = stationData.data.network.stations
                    console.log('network stations', cityMatch, stateMatch, stations.length)
                    const repromptSpeech = `If this is right, say a street name or intersection. Or ask me about another city.`
                    const speech = `I found ${cityMatch}, ${stateMatch || ''} with ${stations.length} ${helper.getReadableId(networkId)} stations; ${repromptSpeech}`;
                    console.log('speech', speech)
                    return handlerInput.responseBuilder
                        .speak(speech)
                        .reprompt(repromptSpeech)
                        .getResponse();
                } catch (err2) {
                    attributes.state = states.NONE;
                    return handlerInput.responseBuilder
                        .speak(`Error getting stations for ${city}. ${WELCOME_PROMPT}`)
                        .reprompt(WELCOME_PROMPT)
                        .getResponse();
                }
            } else {
                attributes.state = states.NONE;
                return handlerInput.responseBuilder
                    .speak(`Sorry, I don't have bike info for ${city}. ${WELCOME_PROMPT}`)
                    .reprompt(WELCOME_PROMPT)
                    .getResponse();
            }
        } catch (err) {
            console.log("error", err)
            attributes.state = states.NONE;
            return handlerInput.responseBuilder
                .speak(`Error looking for bike networks. ${WELCOME_PROMPT}`)
                .reprompt(WELCOME_PROMPT)
                .getResponse();
        }
    }
};

const StationIntent = {
    canHandle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const request = handlerInput.requestEnvelope.request;

        return attributes.state === states.GET_STATION &&
            request.type === 'IntentRequest' &&
            request.intent.name === 'StationIntent';
    },
    async handle(handlerInput) {
        console.log('in StationIntent')
        const attributes = handlerInput.attributesManager.getSessionAttributes()
        attributes.state = states.GET_STATION

        const item = helper.getItem(handlerInput.requestEnvelope.request.intent.slots)
        const streetName = item.StreetName;

        console.log('streetName', streetName)
        const networkId = attributes.networkId

        const stationData = await api.getNetwork(networkId)
        const stations = stationData.data.network.stations

        const matches = helper.getStationMatches(streetName, stations)

        let speech = ""

        const randomStationIndex = helper.getRandom(stations.length)
        const randomStationName = stations[randomStationIndex].name
        const reprompt = `Try asking about another station like ${randomStationName}, or say exit. `
        console.log('reprompt', randomStationIndex, randomStationName, reprompt)

        if (matches && matches.length != 0 && matches.length <= MAX_RESULTS) {
            if (matches.length > 2) {
                const names = matches.map((match) => match.name)
                const matchSpeech = `${names.slice(0, -1).join(', ')}, and ${names.slice(-1)[0]}`
                speech = `I found a few matching stations: ${matchSpeech}. Try one of these. `
            } else if (matches.length == 2) {
                speech = `I found ${matches.length} close matches for ${streetName}. My last update found `
                matches.map((match) => {
                    speech += helper.getBikeInfo(match)
                })
                speech += reprompt;
            } else {
                const match = matches[0]
                speech = `Got it! My last update found ${helper.getBikeInfo(match)}`
                // // TODO: Add the last updated time to the response
                // if (match.extra) {
                //     const lastUpdated = match.extra.last_updated
                //     if (lastUpdated) {
                //         const lastDate = new Date(lastUpdated*1000)
                //         speech += `Updated ${helper.timeSince(lastDate)} ago. `
                //     }
                // }
                speech += reprompt
            }
        } else {
            speech = `I couldn't find a match for ${streetName}. ${reprompt}`
        }

        return handlerInput.responseBuilder
            .speak(speech)
            .reprompt(reprompt)
            .getResponse();
    }
};

// City Biking
// Main Lambda function declaration.
exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        CityBikeIntent,
        StationIntent,
        BikeFactIntent,
        HelpHandler,
        ExitHandler,
        SessionEndedRequestHandler,
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
