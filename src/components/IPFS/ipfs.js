
const ipfsClient = require('ipfs-http-client'); // ipfs api

const ipfs = ipfsClient({ host: '169.254.209.107', 
                          port: 5001 , 
                          protocol: 'http',
                          EXPERIMENTAL: {
                            pubsub: true
                          }});

const baseLink = 'http://169.254.209.107:9090/ipfs/';                          

module.exports = {ipfs , baseLink}; 