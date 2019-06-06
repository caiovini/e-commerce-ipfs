import { Navbar ,  Nav , Modal , Button , Form , FormControl , NavDropdown } from 'react-bootstrap';
import { MdHome , MdAssignment , MdInfo , MdAccountCircle , MdHdrWeak } from 'react-icons/md';
import { LinkContainer } from 'react-router-bootstrap';
import agora from '../../../ethereum/agora';
import md5 from 'md5';
import { NavLink } from 'react-router-dom'; 
import React , { Component } from 'react';
import { IconContext } from 'react-icons';
import logo from './assets/gadsden_flag.png';
import './Navbar.css';

const { withGun } = require('react-gun');

class Navigation extends Component{


    constructor(){

        super();
        this.state = {loginLogout: 'Login' ,
                      showModal: false ,
                      userName: '' ,
                      signature: '' ,
                      password: '' ,
                      error: ''} 

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleChangeUser = this.handleChangeUser.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.tickLogged = this.tickLogged.bind(this);
        this.submit = this.submit.bind(this);
    }

    handleChangeUser(e){

        this.setState({ signature: e.target.value });
    }

    handleChangePassword(e){

        this.setState({ password: e.target.value });
    }

    async submit(){

        if(this.checkFields()){  

            await agora.methods.requireAccess( md5(this.state.signature) , 
                                               md5(this.state.password)  ).call().then( async (user) => {

            if(user[0]){

                this.props.gun.get('user').put({

                    userName: user[0],
                    privateKey: user[1], 
                    signature: md5(this.state.signature),
                    logged: true});

                this.setState({loginLogout: 'Logout' , userName:'' , password: '' , error: '' , showModal: false});
                // Store
                if (typeof(Storage) !== "undefined") {localStorage.setItem("logged", true);}
                
                    alert("Success");
                    window.location.reload();

            }else{

                this.setState( { error: 'User does not exist or password is incorrect' } );}
            
            }).catch((err) => {

                this.setState( { error: err } );
            });
        }
    }

    checkFields(){

        let formIsValid = true;
        let errorMessage = '';

        if(!this.state.signature){

            formIsValid = false;
            errorMessage = 'Please, enter your signature';
        }

        if(!this.state.password && formIsValid){

            formIsValid = false;
            errorMessage = 'Please, enter your password';
        }

        this.setState({ error: errorMessage })
        return formIsValid;

    }

    openModal(){

        if(this.state.loginLogout === 'Login'){

            this.setState({
                showModal: true
            });
        }else{

            this.props.gun.get('user').put({

                userName: '',
                publicKey: '',
                signature: '',
                logged: false
            });

            this.props.gun.user().leave();
            this.setState({
                loginLogout: 'Login'
            });

            if (typeof(Storage) !== "undefined") {localStorage.setItem("logged", false);}
            alert("Log out success");
            window.location.reload();
        }
    }

    closeModal(){

        this.setState({

            showModal: false
        });
    }

    async componentWillMount(){

        this.props.gun.get('user').once((data, key) => {

            if(data) this.checkLogged(data.logged);
        });

        //setInterval(this.tickLogged , 5000); //Keep checking if user is still logged
    }

    tickLogged(){

        //I am using local storage in order to check if user logs in or out using other tabs

        if (typeof(Storage) !== "undefined") {
                        
            const log = localStorage.logged;
            if(typeof(log) !== "undefined"){

                if(log === 'false'){
                    if(this.state.loginLogout === 'Account'){ this.setState({loginLogout: 'Login'});
                                                                        window.location.reload();}
                }else{
                    if(this.state.loginLogout === 'Login'){ this.setState({loginLogout: 'Account'});
                                                                           window.location.reload();}
                }
            }
        }
    }

    checkLogged(logged){

        if(logged){
            this.setState( {loginLogout: 'Account'} );
        }else{
            this.setState( {loginLogout: 'Login'} );
        }
    }

    render (){    

    const navDropdownTitle = (<i><MdHome/>Home</i>);
    const registerTitle = (<i><MdAssignment/>Register new user</i>);
    const infoTitle = (<i><MdInfo/>Info</i>);
    const navAccountLogin = (<i><MdAccountCircle/>{ this.state.loginLogout }</i>)
    const navAccount = (<i><MdAccountCircle/>Account</i>)
    const contributeTittle = (<i><MdHdrWeak/>Contribute</i>)


    return(
        
        <Navbar bg="light" expand="lg" className="nav-bar">

            <NavLink to="/"><img src={logo} className="gads-img" 
                             width="40px" height="40px" alt="Gadsden"/></NavLink>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <IconContext.Provider value={{ className: 'react-icons' }}>

                        <NavLink className="nav-link" to="/">{navDropdownTitle}</NavLink>
                        {this.state.loginLogout === 'Login'
                         ?<NavLink className="nav-link" to="/register">{registerTitle}</NavLink>
                         :<div></div>
                        }

                        <NavLink className="nav-link" to="/info">{infoTitle}</NavLink>
                        <NavLink className="nav-link" to="/contribute">{contributeTittle}</NavLink>
                    </IconContext.Provider>
                </Nav>

                <Nav className="login-link">
                    <IconContext.Provider value={{ className: 'react-icons' }}>

                        {this.state.loginLogout === 'Login'
                          ?<Nav.Link className="nav-link" onClick={this.openModal}>{navAccountLogin}</Nav.Link>
                          :<NavDropdown title={ navAccount } id="basic-nav-dropdown">
                                <LinkContainer to="/userProducts">
                                    <Nav.Link >Sell products</Nav.Link>
                                </LinkContainer>
                                <NavDropdown.Divider />
                                <LinkContainer to="/address">
                                    <Nav.Link >Address</Nav.Link>
                                </LinkContainer>
                                <NavDropdown.Divider />
                                <LinkContainer to="#">
                                    <Nav.Link onClick={this.openModal}>Log out</Nav.Link>
                                </LinkContainer>
                           </NavDropdown>
                        }
                    </IconContext.Provider>
                </Nav>

            </Navbar.Collapse>

            <Modal show={this.state.showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Login user</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="errorMsgModal">{this.state.error}</div>
                    <Form inline className="form-login">
                        <FormControl type="text" placeholder="Signature" className="mr-sm-2" autoComplete=""
                                     onChange={ this.handleChangeUser }/>
                        <FormControl type="password" placeholder="Password" className="mr-sm-2" autoComplete=""
                                     onChange={ this.handleChangePassword }/>                                    
                    
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.submit}>OK</Button>
                </Modal.Footer>
            </Modal>
        </Navbar>
        
    )}
}

export default withGun(Navigation);
