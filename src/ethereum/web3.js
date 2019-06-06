import Web3 from 'web3';

const LINK_NODE_RINKBY = 'https://rinkeby.infura.io/qeU8UeYgoZSlpgkTAbSR';

    
let web3;
if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined'){
    
    //We are on the browser and metamask is running
    web3 = new Web3(window.web3.currentProvider);
    
}else{
    
    //We are on the server or the user is not running metamask
    const provider = new Web3.providers.HttpProvider(LINK_NODE_RINKBY);
    web3 = new Web3(provider);
}


export default web3;    