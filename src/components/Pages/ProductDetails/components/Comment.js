import { Rating } from 'semantic-ui-react'
import avatar from './assets/guyIcon.png'
import Answer from "./Answer";
import React from "react";

export default function Comment(props) {
  const { name, message, dateComment , rating , idComment , category } = props.comment;

  return (
    <div>
      <div style={{fontSize: 18  , display: 'inline'}}>
          <Rating defaultRating={rating} maxRating={5} icon='star' disabled />
      </div>

    <div className="media mb-3">
      <img
      
        className="mr-3 bg-light rounded"
        width="48"
        height="48"
        src={ avatar }
        alt={ name }
      />
      <div className="media-body p-2 shadow-sm rounded bg-light border">
        <small className="float-right text-muted">{ dateComment }</small>
        <h6 className="mt-0 mb-1 text-muted">{ name } says: </h6>

        <textarea
          disabled = {"disabled"}
          value={ message }
          className="form-control"
          name="message"
          rows="4"
        />

        <Answer idComment = { idComment } category={ category } />
      </div>
    </div>
    </div>  
  );
}