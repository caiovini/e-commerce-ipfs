import { Card , Button , Col , CardDeck , Carousel } from 'react-bootstrap';
import React , { Component } from 'react';
import { baseLink } from '../../IPFS/ipfs';
import { products , comments } from '../../orbitdb/orbit';
import { Menu } from 'semantic-ui-react';
import { Rating } from 'semantic-ui-react'
import CommentList from "./components/CommentList";
import CommentForm from "./components/CommentForm";
import './index.css';

const { withGun } = require('react-gun');
const Fetch = require('../../orbitdb/fetch'); //Fetch data from database
const currencyApi = require('../../Currency/Api'); //Get exchange rate
const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ETHEREUM&vs_currencies=BRL%2CBTC%2CUSD';

const ColoredLine = ({ color }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: 0.01
        }}
    />
);

class ProductDetails extends Component{

    constructor(){

        super();

        this.state = {
            dataProducts: null,
            category: '',
            userName: '',
            signature: '',
            isLogged: false,
            comments: [],
            loading: false,
            ratingAverage: 0
        }
        
        this.fetchComments = this.fetchComments.bind(this);
    }

    componentWillMount(){

        this.props.gun.get('user').once((data, key) => {
            
            this.setInitialUserData( data.logged , data.userName , data.signature );
        });

        this.getAverageRating();
    }

    setInitialUserData(logged , userName , signature){

        if(logged){ //Check if user is logged

            this.setState( { isLogged: logged ,  userName , signature });
        }
    }

    async componentDidMount() {

        /* Fetch exchange rates */   

        await currencyApi.getPrice(url).then((result) => {   
                    
            const { brl , usd , btc } = result.ethereum;
            this.setState( {exchangeRate: { brl: brl , usd: usd , btc: btc }} );

        }).catch((reason) => {

            alert('error loading currency: ' + reason);
        }) 

        let items = [];
        const idProduct = this.props.match.params.id;


        Fetch.commit(idProduct , "" ,  products , 'byId').then( async (res) => {

            const data = await res.json();
      
            items.push(
                <Col sm={'auto'} key={data.result[0]._id}>
                    <Card className="card-products-details">
                    {data.result[0].hash.length === 1
                            ? <Card.Img key={ 0 } variant="top" src={baseLink + data.result[0].hash[0].hashLink} />
                            : <Carousel interval={null}>
                                { this.fetchImages(data.result[0].hash) }
                              </Carousel>}
                        <Card.Body> 
                              <Card.Title><h2>{data.result[0].product}</h2></Card.Title>
                              <Card.Text>
                                   Price: ETH {this.getPriceInEther(data.result[0].currency , data.result[0].price)}
                              </Card.Text>
                              <Card.Text>
                                   <textarea style={{ backgroundColor: "#FFF"}}
                                   disabled = "disabled"
                                   value={data.result[0].description}
                                   className="form-control"
                                   rows="5"
                                   />
                              </Card.Text>
                            <Button variant="primary">
                                  <div id={data.result[0]._id}>Buy</div>
                            </Button>
                            <div style={{fontSize: 18  , display: 'inline' , margin: '2%'}}>
                                <Rating defaultRating={this.state.ratingAverage} 
                                    maxRating={5}
                                    icon='star'
                                    disabled />
                            </div>
                        </Card.Body>
                    </Card>
                </Col> 
            )

            this.setState( { dataProducts: items , category: data.result[0].category } );
            this.fetchComments();

        }).catch((err) => {

            alert('error: ' + err);
        
        });      
    }

    getPriceInEther(currency , price){

        let priceInEther = 0;

        switch(currency){

            case 'BRL':

                priceInEther = price / this.state.exchangeRate.brl;
                return priceInEther.toFixed(8);

            case 'BTC':

                priceInEther = price / this.state.exchangeRate.btc;
                return priceInEther.toFixed(8);

            case 'USD':

                priceInEther = price / this.state.exchangeRate.usd;
                return priceInEther.toFixed(8);

            default:

                return priceInEther;
        }
    }

    fetchImages(hashes) {

        let items = [];

        for(let i = 0; i < hashes.length; i ++){

            items.push(<Card.Img key={ i } variant="top" src={baseLink + hashes[i].hashLink} />);
        }

        return items;
    }

    getAverageRating(){

        const idProduct = this.props.match.params.id; //fetch by product id
  
        let ratingAverage = 0;
        let sum = 0;

        Fetch.commit(idProduct , "" ,  comments , 'bySignature').then( async (res) => {

            const data = await res.json();
            for (let i = 0; i < data.result.length; i++) { 
                            
                sum += data.result[i].rating; 
            }   

            if(data.result.length > 0){

                ratingAverage = sum / data.result.length;
                this.setState({ ratingAverage: ratingAverage });

            }else{

                this.setState({ ratingAverage: 0 });

            }    
        });
    }


    fetchComments(){

        const idProduct = this.props.match.params.id; //fetch by product id  
        let items = [];

        Fetch.commit(idProduct , "" ,  comments , 'bySignature').then( async (res) => {

            const data = await res.json();
            data.result.sort(this.compare);
      
            for (let i = 0; i < data.result.length; i++) {
                
                items.push(
                    { idComment: data.result[i]._id ,
                    dateComment: data.result[i].dateComment ,
                           name: data.result[i].name ,
                        message: data.result[i].message ,
                         rating: data.result[i].rating , 
                       category: this.state.category } 
                )
            }
            
            this.setState( { comments: items } );

        }).catch((err) => {

            alert('error: ' + err);
        
        });      
    }

    compare(a, b) { // Sort array br comparing date

        if (a.dateComment < b.dateComment) 
            return -1; 
        if (a.dateComment > b.dateComment) 
            return 1; 
        return 0; 
    } 

    /*
    /Reload comments when user adds a new one
    */
   reloadComments() {
        
        this.fetchComments();
    }


    render(){

        return(

            <div>
                {this.state.dataProducts === null
                    ? <div>loading</div>
                    : <CardDeck className="row-products"> 
                        { this.state.dataProducts } 
                    </CardDeck>
                }
                        
                <Menu className="menu-desc-details">
                    <h2>Your thoughts about the product</h2>
                </Menu>

                <div className="comment container bg-light shadow">
                    <div className="row">
                        <div className="col-4 border-right">
                            <h6>Say something about it</h6>
                            <CommentForm userName={ this.state.userName } 
                                           logged={ this.state.isLogged }
                                        idProduct={ this.props.match.params.id }
                                         category={ this.state.category }
                                   reloadComments={ this.reloadComments.bind(this) } />
                        </div>
                        <div className="col-8 bg-white">
                            <CommentList
                                 loading={ this.state.loading }
                                comments={ this.state.comments }/>
                        </div>
                    </div>
                </div>

                <ColoredLine color="black"></ColoredLine>

            </div>
        )
    }
}

export default withGun(ProductDetails);