const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const config = require('./config.json');
const CosmosClient = require("@azure/cosmos").CosmosClient;
const dbconfig = require("./config");
const dbContext = require("./db-initialization");
const cors = require('cors');

const BearerStrategy = require('passport-azure-ad').BearerStrategy;


const options = {
    identityMetadata: `https://${config.metadata.b2cDomain}/${config.credentials.tenantName}/${config.policies.policyName}/${config.metadata.version}/${config.metadata.discovery}`,
    clientID: config.credentials.clientID,
    audience: config.credentials.clientID,
    policyName: config.policies.policyName,
    isB2C: config.settings.isB2C,
    validateIssuer: config.settings.validateIssuer,
    loggingLevel: config.settings.loggingLevel,
    passReqToCallback: config.settings.passReqToCallback,
    scope: config.protectedRoutes.scopes
}

const bearerStrategy = new BearerStrategy(options, (token, done) => {
        // Send user info using the second argument
        done(null, { }, token);
    }
);

const app = express();
app.use(cors());
app.use(express.json());

app.use(morgan('dev'));

app.use(passport.initialize());

passport.use(bearerStrategy);

//enable CORS (for testing only -remove in production/deployment)
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });


// db precode
let client = undefined;
let database = undefined;
let container = undefined;



async function initialize(){ const { endpoint, key, databaseId, containerId } = dbconfig;
          
 client = new CosmosClient({ endpoint, key });

 database = client.database(databaseId);
 container = database.container(containerId);

// Make sure Tasks database is already setup. If not, create it.
await dbContext.create(client, databaseId, containerId);

console.log("db initialize called and ceated")
// </CreateClientObjectDatabaseContainer>
}
initialize()











// exposed API endpoint
app.post('/device/addnew',
    passport.authenticate('oauth-bearer', {session: false}),
    async (req, res) => {
        try{

        
        console.log("devicedeyjhb")
        console.log('Validated claims: ', req.authInfo);  
            // <CreateClientObjectDatabaseContainer>

            console.log(req.body,"hj")
              


            // const newItem = {
            //     userid: req.authInfo['sub'],
            //     category: "lightning",
            //     name: "shuja",
            //     description: "lounge buld",
            //     isComplete: false,
            //     status:"off"
            //   };

            const newItem=req.body;
            // console.log(newItem,"new item is");

                        /** Create new item
             * newItem is defined at the top of this file
             */
            const { resource: createdItem } = await container.items.create(newItem);

            console.log(`\r\nCreated new item: ${createdItem.id} - ${createdItem.description}\r\n`);

            const querySpec = {
                query: `SELECT * FROM c
                WHERE c.category = "${createdItem.category}" AND c.user="${req.authInfo['sub']}"          
                `
              };
              // read all items in the Items container
              const { resources: items } = await container.items
                .query(querySpec)
                .fetchAll();    


        // Service relies on the name claim.  
        res.status(200).json(items);
            }
            catch(e){
                console.log(e)
                res.status(500).json(e)
            }
    }
);


app.get('/devices/:category',passport.authenticate('oauth-bearer', {session: false}),
   
    async (req, res) => {
        console.log('Validated claims: ', req.authInfo);  
        const {category} = req.params;
        console.log(category,'cccccccccccccccc');

        try{
        console.log(`Querying container: Items`);
        // query to return all items
        const querySpec = {
          query: `SELECT * FROM c
          WHERE c.category = "${category}" AND c.user="${req.authInfo['sub']}"          
          `
        };
        // read all items in the Items container
        const { resources: items } = await container.items
          .query(querySpec)
          .fetchAll();    
        res.status(200).json(items);
    }
    catch(Err){
        console.log(Err)
        res.status(500).json(Err)
    }
    }
);



// Update a device Info
app.put('/devices/:category/:id',passport.authenticate('oauth-bearer', {session: false}),
   
    async (req, res) => {
        console.log('Validated claims: ', req.authInfo);  
        const {category,id} = req.params;
        console.log(category,id,'cccccccccccccccc');

        try{
            const updatedData = req.body;

         
            
            const { resources: updatedItem } = await container
              .item(id, category)
              .replace(updatedData);
            //   item is being updated but getting undefined in upDateditm

            const querySpec = {
                query: `SELECT * FROM c
                WHERE c.category = "${category}" AND c.user="${req.authInfo['sub']}"          
                `
              };
              // read all items in the Items container
              const { resources: items } = await container.items
                .query(querySpec)
                .fetchAll();    
              res.status(200).json(items);
    }
    catch(Err){
        console.log(Err)
        res.status(500).json(Err)
    }
    }
);



// Deleting a device


app.delete('/devices/:category/:id',passport.authenticate('oauth-bearer', {session: false}),
   
    async (req, res) => {
        console.log('Validated claims: ', req.authInfo);  
        const {category,id} = req.params;
        console.log(category,id,'cccccccccccccccc');

        try{
            
            const { resource: result } = await container.item(id, category).delete();
            console.log(`Deleted item with id: ${id}`,result,"anthing?");
         
            
   
            //   item is being updated but getting undefined in upDateditm

            const querySpec = {
                query: `SELECT * FROM c
                WHERE c.category = "${category}" AND c.user="${req.authInfo['sub']}"          
                `
              };
              // read all items in the Items container
              const { resources: items } = await container.items
                .query(querySpec)
                .fetchAll();    
              res.status(200).json(items);
    }
    catch(Err){
        console.log(Err)
        res.status(500).json(Err)
    }
    }
);




































const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Listening on port ' + port);
});

module.exports = app;