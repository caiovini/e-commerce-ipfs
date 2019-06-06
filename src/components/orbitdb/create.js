import { urlOrbit } from './orbit';

export function commit(query){

    return new Promise(async (resolve , reject) =>{

        
        await fetch(`${urlOrbit}/create/docstore/test`).then((res) => {

            resolve(res);

        }).catch((err) => {
      
            reject("Something went wrong while updating data. " + err);
            
        });
    })
}