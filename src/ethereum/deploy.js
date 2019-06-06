
//Run command line ---> node deploy.js

const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const agora = require('./build/Agora.json');

const output = require('./compile');

const NMEMONIC_RINKBY = 'tourist accuse pattern time powder penalty large boil frown anger scatter need';
const LINK_NODE_RINKBY = 'https://rinkeby.infura.io/qeU8UeYgoZSlpgkTAbSR';


//Set provider to use in the web3
const provider = new HDWalletProvider(NMEMONIC_RINKBY, LINK_NODE_RINKBY);
const web3 = new Web3(provider);

//Deploy function to use await

const deploy = async () => {
    
    const accounts = await web3.eth.getAccounts();
    const balance  = await web3.eth.getBalance(accounts[0]);
    
    console.log('Balance ' , balance);
    console.log('Attenpting to deploy from account ' , accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(agora.interface))
                           // add '0x' to deploy to the network
                  .deploy({ data: '0x' + agora.bytecode })
                    .send({ from: accounts[0] , gas: '2000000'    });
    
    result.setProvider(provider);
    
    console.log('Interface : ' , JSON.parse(agora.interface));
    console.log('Contract deployed at : ' , result.options.address);
}
deploy();
