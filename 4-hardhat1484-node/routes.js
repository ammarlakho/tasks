

function routes(app, instance, accounts) {
    app.get('/', (req, res) => {
        res.json({ message: 'WELCOME!' });
    })

    app.get('/identity/', async(req, res) => {
        if(req.query.ein){
            console.log(instance.handleRevert);
            let ein = req.query.ein;
            console.log(ein);

            instance.methods.getIdentity(ein).call()
            .then((result) => {
                console.log(result);
                res.send(result);
            })
            .catch((error) => {
                // console.log(error);
                res.status(400).json({"status":"Failed", "error": error});
            })
            
        }
        else if(req.query.address) {
            let address = req.query.address;
            console.log(address);
            try {
                let EIN = await instance.methods.getEIN(address).call();
                console.log(EIN);
                let identity = await instance.methods.getIdentity(EIN).call()
                res.send(identity);
            }
            catch(error) {
                res.status(400).json({"status":"Failed", error});
            }
        }

        else {
            res.status(400).json({"status":"Failed", "reason":"wrong query parameter"});
        }
    })

    app.post('/identity/', async (req, res) => {
        if(!req.body) {
            res.status(400).send({message: "Content cannot be empty!"});
            return;
        }

        try {
            console.log("hi");
            console.log(req.body.recoveryAddress);
            console.log(req.body.providers);
            console.log(req.body.resolvers);
            console.log("bye");
            let ans = await instance.methods.createIdentity(
                            req.body.recoveryAddress, 
                            req.body.providers, 
                            req.body.resolvers)
                            .send({from: accounts[0]});
            let rValues = ans.events.IdentityCreated.returnValues
            res.send(`Created an identity with ein = ${rValues.ein}  
                    associatedAddress = ${rValues.associatedAddress}
                    providers = ${rValues.providers}
                    resolvers = ${rValues.resolvers}
                    `);
        }
        catch(error) {
            res.status(400).json({"status":"Failed", error});
        }
        
    })
    
}


module.exports = routes;


// let exists = await instance.methods.identityExists(ein).call();
// if(!exists) {
//     res.status(400).json({"status":"Failed", "message": "No identity found for this ein."});
//     return
// }

// instance.methods.getIdentity(ein)
// .estimateGas()
// .then((gasAmount) => {
//     console.log(`Gas amount=${gasAmount}`);
// })
// .catch((error) => {
//     console.log(`error=${error}`);
// });


// instance.methods.getIdentity(ein).call( function(error, result){
//     if(!error) {
//         console.log(result)
//         res.send(result);
//     }
//     else {
//         console.error(error);
//         res.send(error);
//     }
// });

// try {
//     let ans = await instance.methods.getIdentity(ein).call();
//     console.log(ans);
//     res.send(ans);
// }
// catch(error) {
//     // console.log((error));
//     // console.log(error)
//     // res.send(error);
//     res.status(400).json({"status":"Failed", "error": error});
// }


// instance.methods.getEIN(address).call()
//     .then((result) => {
//         EIN = result;
//         console.log(`RESULT: ${EIN}`);
//         // res.send(result);
//     })
//     .catch((error) => {
//         console.log(error);
//         res.status(400).json({"status":"Failed", "error": error});
//         return;
//     })

// instance.methods.getIdentity(EIN).call()
    // .then((result) => {
    //     console.log(result);
    //     res.send(result);
    // })
    // .catch((error) => {
    //     console.log(error);
    //     res.send(result);
    // });