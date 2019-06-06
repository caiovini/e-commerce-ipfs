
export function getPrice(url){

    return new Promise(async (resolve , reject) =>{

        let err = null;

        fetch(url)
          .then(results => {

            resolve(results.json());

        }).catch((e) => {
      
            err = e;

        }).then(() => {
            if (err != null) {
  
            reject("Something went wrong while fetching data. " + err);
        }});
        
    })
}