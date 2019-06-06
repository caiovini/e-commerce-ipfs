import { urlOrbit } from './orbit';

export function commit(query , table){

    return new Promise(async (resolve , reject) => {

        await fetch(`${urlOrbit}/add${table}`, { 
            method: 'POST', 
            body: JSON.stringify(query),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/plain'}

        }).then((res) => {
         
            resolve(res);

        }).catch((err) => {
      
            reject("Something went wrong while submitting form. " + err);

        });

    })    
}
    

