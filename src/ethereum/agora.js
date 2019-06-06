import Agora from './build/Agora.json';
import web3 from './web3.js';

const instance = new web3.eth.Contract(
      JSON.parse(Agora.interface),
      '0x44b38a1d4225ce6d2bc4c0fdc852c0d370e21d8d'
);

export default instance;