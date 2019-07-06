
const ipfsClient = require('ipfs-http-client'); // ipfs api

const ipfs = ipfsClient({ host: 'localhost', 
                          port: 5001 , 
                          protocol: 'http',
                          EXPERIMENTAL: {
                            pubsub: true
                          }});

const baseLink = 'http://localhost:9090/ipfs/';                          

module.exports = {ipfs , baseLink}; 
