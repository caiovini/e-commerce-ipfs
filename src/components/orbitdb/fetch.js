import { urlOrbit } from './orbit';

export function commit(_id , term , table , fetchType){

    return new Promise(async (resolve , reject) =>{

        await fetch(`${urlOrbit}${table}` , { 
            method: 'POST', 
            body: JSON.stringify({ _id: _id , term: term , fetchType: fetchType}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/plain'}
                
        }).then((res) => {

            resolve(res);

        }).catch((err) => {
  
            reject("Something went wrong while fetching data. " + err);
        });
        
    })
}