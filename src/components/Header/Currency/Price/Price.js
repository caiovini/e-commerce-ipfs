import React , { Component } from 'react';

const Api = require('../../../Currency/Api');
const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ETHEREUM&vs_currencies=BRL%2CBTC%2CUSD';

class Price extends Component{

    constructor(){

        super();
        this.state = { brl: "" , btc: "" , usd: "" };
    }

    componentDidMount(){

        Api.getPrice(url).then((result) => {
      
            this.setState( { brl: result.ethereum.brl , btc: result.ethereum.btc , usd: result.ethereum.usd } );

        }).catch((reason) => {

            alert('error loading comments: ' + reason);
        })    
    }

    render(){

        return(

        <div className="col-sm-6">
            <div className="shopping-currency">
                <a target="_blank" rel="noopener noreferrer" href="https://www.coingecko.com/en">ETH - BRL <span className="price"> $ {this.state.brl}</span></a>
            </div>
            <div className="shopping-currency">
                <a target="_blank" rel="noopener noreferrer" href="https://www.coingecko.com/en">ETH - BTC <span className="price"> $ {this.state.btc}</span></a>
            </div>
            <div className="shopping-currency">
                <a target="_blank" rel="noopener noreferrer" href="https://www.coingecko.com/en">ETH - USD <span className="price"> $ {this.state.usd}</span></a>
            </div>
        </div>  

        );

    }

}

export default Price;