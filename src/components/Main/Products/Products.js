import React  , { Component } from 'react';
import { Card , Button , Col , CardDeck , Form , FormControl , Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { baseLink } from '../../IPFS/ipfs';
import { products } from '../../orbitdb/orbit';
import Menu from '../Slidemenu/Menu';
import MenuButton from '../Slidemenu/MenuButton';
import './Products.css';

const { withGun } = require('react-gun');
const Fetch = require('../../orbitdb/fetch'); //Fetch data from database
const currencyApi = require('../../Currency/Api'); //Get exchange rate
const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ETHEREUM&vs_currencies=BRL%2CBTC%2CUSD';

class Products extends Component {

    constructor(){

        super();
        this.state = {
            categorySearch: 'Electronics' ,
            formSearch: '',
            visible: false,
            toggleButton: false,
            dataProducts: null,
            exchangeRate: {}
        }   
        
        this.searchProducts = this.searchProducts.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseDownButton = this.handleMouseDownButton.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.formSearchProducts = this.formSearchProducts.bind(this);
        this.getForm = this.getForm.bind(this);
    };

    componentWillMount(){

        document.addEventListener('mousedown' , this.handleClick , false);
    }

    componentWillUnmount(){

        document.removeEventListener('mousedown' , this.handleClick , false);
    }

    handleClick = (event) => {

        if(event.toElement.id !== 'html-id'){               // Check which elements 
            if(event.toElement.id !== 'category-id'){       // the user can click without
                if(event.toElement.id !== 'roundButton'){   // hiding the sliding menu
                    if(event.toElement.id !== 'flyoutMenu' && this.state.visible){
                        
                        this.setState({ visible: false });  //Hide menu
                    }
                }    
            }    
        }
    }

    toggleMenu(id) {

        this.setState({
            visible: false,
            toggleButton: false,
            categorySearch: id, //Category is passed as id
        });

        this.searchProducts(id); 
    }    

    handleMouseDown(e , id) {

        this.toggleMenu(id);
        e.stopPropagation();
    }

    handleMouseDownButton(e){

        this.setState({

            visible: true, //Make menu visible
            toggleButton: true
        });
    }

    searchProducts(category){

    /* Fetch products from the ipfs and orbit networks */

        let items = [];
        let searchTerm = '';
        let searchType = 'byCategory';

        //If category is not true search by term
        if(!category){ searchType = 'byTerm'; searchTerm = this.state.formSearch } 

        Fetch.commit(category , searchTerm ,  products , searchType).then( async (res) => {

            const data = await res.json();
            
            for(let i = 0; i < data.result.length; i ++){

                console.log(data.result[i].hash[0].hashLink);
                    
                items.push(
                    <Col sm={'auto'} key={data.result[i]._id}>
                        <Card className="card-products">
                        {data.result[i].hash.length === 1
                                ? <Card.Img key={ i } variant="top" src={baseLink + data.result[i].hash[0].hashLink} />
                                : <Carousel interval={null}>
                                    { this.fetchImages(data.result[i].hash) }
                                  </Carousel>}
                            <Card.Body>
                                <Card.Title>{data.result[i].product}</Card.Title>
                                <Card.Text>
                                    Price: ETH {this.getPriceInEther(data.result[i].currency , data.result[i].price)}
                                </Card.Text>
                                <Card.Text>
                                    Number in stock: {data.result[i].stock}
                                </Card.Text>
                                    {data.result[i].stock !== '0'
                                ?<Link target="_blank" rel="noopener noreferrer" to={`/productDetails/${data.result[i]._id}`}>
                                <Button variant="primary" >
                                    <div id={data.result[i]._id}>Details</div>
                                </Button>
                                </Link>:<div></div>}   
                            </Card.Body>
                        </Card>
                    </Col> 
                ); 
            }

            this.setState({ dataProducts: items });

        }).catch((err) => {

            alert('error: ' + err);
        
        });
    }  

    fetchImages(hashes) {

        let items = [];

        for(let i = 0; i < hashes.length; i ++){

            items.push(<Card.Img key={ i } variant="top" src={baseLink + hashes[i].hashLink} />);

        }

        return items;
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

    formSearchProducts(e){

        e.preventDefault();
        this.searchProducts(""); //Send empty parameter to search by term
    }

    async componentDidMount() {

          /* Fetch exchange rates */   

          await currencyApi.getPrice(url).then((result) => {   
                    
              const { brl , usd , btc } = result.ethereum;
              this.setState( {exchangeRate: { brl: brl , usd: usd , btc: btc }} );

          }).catch((reason) => {

              alert('error loading currency: ' + reason);
          }) 

          this.searchProducts('Electronics'); //Initial category
    }  

    getForm(e){

        e.preventDefault();

        this.setState({
            formSearch: e.target.value
        });
    }  

    render(){

        return (

            <div style={{ marginTop: '2%' }} >
            
                <MenuButton handleMouseDownButton={this.handleMouseDownButton}/>
                <span style={ {marginLeft: "20px"} }><b>{this.state.categorySearch}</b></span>
                <Menu handleMouseDown={this.handleMouseDown}
                      menuVisibility={this.state.visible}/>
                                
                <Form inline className="form-search" onSubmit = { this.formSearchProducts }>
                    <FormControl type="text" placeholder="Search" className="mr-sm-2" 
                                onChange={ this.getForm }/>
                    <Button type="submit">Search</Button>            
                        
                </Form>

                {this.state.dataProducts === null 
                ? <div>Loading</div>
                : <CardDeck className="row-products"> 
                      { this.state.dataProducts } 
                  </CardDeck>
                }
            </div>
        );}  

    }

export default withGun(Products);
