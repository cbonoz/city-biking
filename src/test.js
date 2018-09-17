const api = require('./api')
const helper = require('./helper')

api.getAllNetworks().then(data => {
    let networks = data.data.networks
    const city = "Boston"
    networks = helper.getUSNetworks(networks)
    const networkMatches = helper.getNetworkMatches(city, undefined, networks)
    const networkId = networkMatches[0].id
    const cityMatch = networkMatches[0].location.city
    console.log(networkId, cityMatch)
    api.getNetwork(networkId).then(networkData => {
        const stations = networkData.data.network.stations
        const cityMatches = helper.getStationMatches('binney', stations)
        console.log(JSON.stringify(cityMatches))

    })
});


// api.getAllNetworks().then(networkData => {
//     let networks = helper.getUSNetworks(networkData.data.networks)
//     networks.map(network => console.log(network.location.city))
// })