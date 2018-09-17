const library = (function () {

    const Fuse = require('fuse.js');

    const MATCH_THRESHOLD = .55 // lower is better.
    const SCORE_THRESHOLD = .5 // lower is better.

    const CITIES = [
        "Aspen, CO",
        "Miami Beach, FL",
        "San Francisco Bay Area, CA",
        "San Diego, CA",
        "Denver, CO",
        "Boulder, CO",
        "Fort Lauderdale, FL",
        "Des Moines, IA",
        "Charlotte, NC",
        "Fort Worth, TX",
        "Salt Lake City",
        "Greenville, SC",
        "Houston, TX",
        "Kansas City, MO",
        "Madison, WI",
        "Nashville, TN",
        "Omaha, NE",
        "San Antonio, TX",
        "Spartanburg, SC",
        "Fargo, ND",
        "Austin, TX",
        "Indianapolis, IN",
        "Milwaukee, WI",
        "Evans, GA",
        "Savannah, GA",
        "Rapid City, SD",
        "Pittsburgh",
        "El Paso, TX",
        "Battle Creek, MI",
        "Dayton, OH",
        "Philadelphia, PA",
        "West Palm Beach Florida",
        "Ann Arbor, MI",
        "Portland, OR",
        "San Ramon, CA",
        "Boise, ID",
        "Santa Monica, CA",
        "Buffalo, NY",
        "Washington, DC",
        "New York, NY",
        "Cincinnati, OH",
        "Tampa, FL",
        "Columbus, OH",
        "Chicago, IL",
        "Phoenix, AZ",
        "Boston, MA",
        "Orlando, FL",
        "Los Angeles, CA",
        "Ketchum / Sun Valley, ID",
        "Minneapolis, MN",
        "University of South Florida, FL",
        "Long Beach, NY",
        "Topeka, KS",
        "University of Virginia, VA",
        "Atlanta, GA",
        "Chattanooga, TN",
        "Kent State",
        "Hoboken",
        "Weehawken",
        "Bayonne",
        "Guttenberg",
        "West New York",
        "North Bergen",
        "Liberty State Park"
    ]

    const BIKING_FACTS = [
        "Cycling three hours or 30 kilometres per week halves your risk of heart disease and strokes",
        "Women who walk or bike 30 minutes a day have a lower risk of breast cancer.",
        "Countries with the highest levels of cycling and walking generally have the lowest obesity rates.",
        "A study of nearly 2,400 adults found that those who biked to work were fitter, leaner, less likely to be obese, and had better triglyceride levels, blood pressure, and insulin levels than those who didn’t active commute to work.",
        "An adult cyclist typically has a level of fitness equivalent to someone 10 years younger and a life expectancy two years above the average.",
        "Bicycle commuting burns an average of 540 calories per hour.",
        "Figures show the average person will lose 13 lbs, about 5.8 kilograms, in their first year of cycling to work",
        "The longest tandem bicycle seated 35 people, it was more than 20 meters long",
        "You can fit about 15 bicycles in the same space that one car occupies",
        "It is 20 times cheaper to maintain a bicycle than a car",
        "If the number of cyclists was tripled, the rate of motorist-bicyclist accidents would be cut in half",
        "The world manufactures about 100 million bikes each year",
        "Bicycle delivery services have become a significant industry over the last 30 years",
        "The Tour de France was established in 1903.",
        "China boasts more than a half billion bicycles",
        "In America, people use their bikes for one out of every hundred trips",
        "The fastest bicyclist is American rider, John Howard",
        "There are twice as many bicycles in the world than cars",
        "A study found almost three - quarters of fatal crashes(74 %) in NYC involved a head injury and nearly all bicyclists who died(97 %) were not wearing a helmet.Helmets have been found to be 85 % effective in preventing head injury.",
        "The risk of fatality while cycling is just once every 32 million kilometres(20 million miles), or over 800 times around the world.",
        "How many bikes can be parked in a single car parking space in a paved lot ? Anywhere from 6 to 20.",
        "When Worldwatch Institute compared energy used per passenger - mile(calories), they found that a bicycle needed only 35 calories, whereas a car expended a whopping 1, 860. Bus and trains fell about midway between, and walking still took 3 times as many calories as riding a bike the same distance.",
        "Bicycles use 2 % as much energy as cars per passenger - kilometer, and cost less than 3 % as much to purchase.",
        "If Americans double their bike use to 2 % of all urban trips, they would save 3.5 billion litres of gasoline annually.",
        "Compared to cars, a daily 16 kilometre commute saves the rider close to $15 per day, 5 kilos of carbon dioxide emissions and they burn around 360 extra calories.",
        "On a bicycle you can travel up to 1037 kilometres on the energy equivalent of a single litre of gas.",
        "here are over a half billion bicycles in China.Bikes were first brought to China in the late 1800s.",
        "About 100 million bicycles are manufactured worldwide each year.",
        "There are roughly one billion bicycles in the world(about twice as many as motor vehicles) and roughly half a billion of them are in China.",
        "Americans use their bicycles for less than one percent of all urban trips.Europeans bike in cities a lot more often—in Italy 5 percent of all trips are on bicycle, 30 percent in the Netherlands, and seven out of eight Dutch people over age 15 have a bike.",
        "Maintaining a bike annually costs twenty times less than maintaining and driving a car.",
        "The bicycle is the most efficient vehicle ever devised; a human on a bicycle is more efficient(in calories expended per kilo and per kilometer) than a train, truck, airplane, boat, car, or motorcycle.It is 3 times as efficient as walking.",
        "Cycling is the worlds biggest sports goods business worth approximately 51 billion dollars annually.",
        "Wiggle ships more than 35, 000 packages per week.",
        "The energy required to cycle at low to medium speeds is roughly the same as the energy required to walk.",
        "Cycling is the most efficient way to get around in the world.",
        "In 1985, John Howard, Olympic cyclist and Ironman triathlon winner from the US, set the world speed record for a bicycle when he reached 152.2 mph(245, 08 km / h) cycling in the slipstream of a specially designed car.The record would stand until October 3, 1995 when Dutch cyclist Fred Rompelberg pedaled in the slipstream of a dragster at 167.044 mph(268, 831 km / h), a record that still stands.",
        "Fred A.Birchmore, 25, circled the globe by bicycle in 1935. The entire trip, through Europe, Asia, and the United States, covered forty thousand miles.He pedaled about 25, 000 miles.The rest was traveled by boat.He wore out seven sets of tires.",
        "Mike Hall is the current world record holder for biking around the world in 91 days and 18 hours.Biking 28, 968 km in total which averages to over 315km per day.",
        "The worlds longest bicycle is 92 feet long.",
        "Air - filled tyres were used on bicycles before they were used on motorcars.",
        "The Tour de France is one of the most famous bicycle races in the world.Established in 1903, it is considered to be the biggest test of endurance out of all sports."
    ]

    function getRandom(n) {
        return Math.floor(Math.random() * n)
    }

    function getReadableId(networkId) {
        return networkId.split('-').join(' ')
    }

    function getBikeFact() {
        const randomValue = getRandom(BIKING_FACTS.length)
        return BIKING_FACTS[randomValue]
    }

    function getNetworkMatches(city, state, networks) {

        // If state is undefined filter out the state parameter from the network location results.
        if (!state || state.length == 0) {
            networks = networks.map(network => {
                network['location']['city'] = network['location']['city'].split(',')[0]
                return network
            })
        }

        var searchOptions = {
            shouldSort: true,
            threshold: MATCH_THRESHOLD,
            includeScore: true,
            location: 0,
            tokenize: true,
            distance: 0,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: [
                "location.city",
            ]
        };

        var fuse = new Fuse(networks, searchOptions); // "networks" is the item array
        var result = fuse.search(city)
            .filter(item => item.score <= SCORE_THRESHOLD)
            .map(item => item.item)
        return result
    }


    function getStationMatches(street, stations) {

        var searchOptions = {
            shouldSort: true,
            threshold: MATCH_THRESHOLD,
            location: 0,
            distance: 0,
            tokenize: true,
            includeScore: true,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: [
                "name",
                "extra.address"
            ]
        };

        var fuse = new Fuse(stations, searchOptions); // "stations" is the item array
        var result = fuse.search(street)
            .filter(item => item.score <= SCORE_THRESHOLD)
            .map(item => item.item)
        return result
    }


    function timeSince(date) {

        var seconds = Math.floor((new Date() - date) / 1000);
      
        var interval = Math.floor(seconds / 31536000);
      
        if (interval > 1) {
          return interval + " years";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
          return interval + " months";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
          return interval + " days";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
          return interval + " hours";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
          return interval + " minutes";
        }
        return Math.floor(seconds) + " seconds";
      }

    function getItem(slots) {
        const itemMap = {}
        console.log('slots', JSON.stringify(slots))
        const keys = Object.keys(slots)
        keys.map((key) => {
            itemMap[slots[key].name] = slots[key].value
        })
        // console.log('itemMap', JSON.stringify(itemMap))
        return itemMap
    }

    function getBikeInfo(station) {
        let bikesText;
        if (station.free_bikes == 0) {
            bikesText = `There are no free bikes at ${station.name}. `
        } else {
            const totalBikes = station.free_bikes + station.empty_slots;
            bikesText = `${station.free_bikes} of ${totalBikes} bikes are free at ${station.name}. `
            // if (station.free_bikes / totalBikes < .25) {
            //     bikesText += "Not that many here! ";
            // }
        }
        return bikesText;
    }

    function getUSNetworks(networks) {
        if (networks && networks.length > 0) {
            return networks.filter(network => network['location'] != undefined && network['location']['country'] === 'US')
        }
        return []
    }

    function getRandomCity() {
        const index = getRandom(CITIES.length)
        return CITIES[index]
    }

    return {
        getRandomCity,
        getBikeFact,
        getRandom,
        getReadableId,
        getUSNetworks,
        getNetworkMatches,
        getStationMatches,
        getItem,
        getBikeInfo,
        timeSince
    }

})();
module.exports = library;

