import React, { Component } from "react";
import './css/MenuButton.css';

class MenuButton extends Component {
  render() {
    return (
        <button id="roundButton"  
              onMouseDown={this.props.handleMouseDownButton}></button> 
             
    );
  }
}
 
export default MenuButton;