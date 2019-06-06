const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const agora = require('../src/ethereum/build/agora.json');

beforeEach(async () => {
    
   accounts = await web3.eth.getAccounts();
   contract  = await new web3.eth.Contract(JSON.parse(agora.interface))
             .deploy({ data: agora.bytecode })
               .send({ from: accounts[0] , gas: '1000000' });

}); 


describe('Campaigns' , () =>{
    
    it('Deploys contract' , () => {
       
        assert.ok(contract.options.address);
        
    });
    
});