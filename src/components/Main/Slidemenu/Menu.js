import React, { Component } from "react";
import { Container } from 'react-bootstrap';
import { MdKeyboardArrowRight } from "react-icons/md";
import { Divider } from 'semantic-ui-react'
import "./css/Menu.css";

class Menu extends Component {
  render() {
    var visibility = "hide";
 
    if (this.props.menuVisibility) {
      visibility = "show";
    }
 
    return (
      <Container id="flyoutMenu"
           //onMouseDown={this.props.handleMouseDown} 
          className={visibility}>
          <div style={{ marginTop: '20px'}}>
            <h1 style={{ marginLeft: '10px' , marginBottom: '50px'}}>Categories</h1>   
          </div>
            <h2 id="category-id"><a onMouseDown={ (e) => this.props.handleMouseDown(e , 'Electronics')} href="#home" ><MdKeyboardArrowRight /> Electronics</a></h2>
          <Divider/>
            <h2 id="category-id"><a onMouseDown={ (e) => this.props.handleMouseDown(e , 'Kitchenware')} href="#home" ><MdKeyboardArrowRight /> Kitchenware</a></h2>
          <Divider/>
            <h2 id="category-id"><a onMouseDown={ (e) => this.props.handleMouseDown(e , 'House')} href="#home" ><MdKeyboardArrowRight /> House</a></h2>
          <Divider/>
            <h2 id="category-id"><a onMouseDown={ (e) => this.props.handleMouseDown(e , 'Car')} href="#home" ><MdKeyboardArrowRight /> Car</a></h2>
          <Divider/>

      </Container>
    );
  }
}
 
export default Menu;