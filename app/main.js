const helper = require('./helper');
const { Connection, Request } = require('tedious');
const nconf = require('nconf');
const AzureSearchClient = require('./AzureSearchClient.js');
const indexDefinition = require('../books_quickstart_index.json');
/** create connection */
const config = {
    authentication: {
        options: {
            userName: 'ardhihdra',
            password: 'password123!'
        },
        type: 'default'
    },
    server: 'ardhiappserver.database.windows.net',
    options: {
        database: 'submission2db',
        encrypte: true,
        rowCollectionOnRequestCompletion: true
    }   
  };  

app = {
    mainPage: function(req, res, next) {
        res.sendFile('index.html', {root: './views' }); // __dirname   
        // res.render('index', { title: 'Express' });
    },
    newBook: function(req, res) {   
      let connection = new Connection(config);
      connection.on('connect', err => {
          if (err) {
            console.log(err);
          } else {
            console.log('connected');
            helper.postData(req, res, connection);
          }
      })
    },
    getBooks: function(req, res) {
      let list = ``;
      let connection = new Connection(config);
      connection.on('connect', err => {
          if (err) {
            console.log(err);
          } else {
            console.log('connected');
            helper.getData(req, res, connection);
          }
      });      
    },
    searchBook: async function(req, res) {
      console.log(req.body.search);
      const queries = [
        req.body.search
      ]
      console.log("query", queries[0]);
      try {
        const cfg = this.getAzureConfiguration();
        const client = new AzureSearchClient(cfg.get("serviceName"), cfg.get("adminKey"), cfg.get("queryKey"), cfg.get("indexName"));
        
        const exists = await client.indexExistsAsync();
        // await exists ? client.deleteIndexAsync() : Promise.resolve();
        // // // Deleting index can take a few seconds
        // await this.sleep(2000);
        // await client.createIndexAsync(indexDefinition);
        
        // Data availability can take a few seconds
        helper.searchBook(req, res, client, queries);
      } catch (x) {
          console.log("ERROR", x);
          res.sendStatus(400);
      }
    },
    getAzureConfiguration: function() {
        const config = nconf.file({ file: 'azure_search_config.json' });
        if (config.get('serviceName') === '[SEARCH_SERVICE_NAME]' || !config.get('serviceName')) {
            throw new Error("You have not set the values in your azure_search_config.json file. Change them to match your search service's values.");
        }
        return config;
    },
    getCatalogue: function(req, res) {
      let connection = new Connection(config);
      connection.on('connect', err => {
          if (err) {
            console.log(err);
          } else {
            console.log('connected');
            const request = new Request(
              `SELECT TOP (100) *
              FROM [dbo].[Book]`,
              (err, rowCount, rows) => {
                if (err) {
                  // console.error(err.message);
                  res.send({status: 0, message: err.message});
                } else {
                  console.log(`${rowCount} row(s) returned`);
                  let response = []
                  rows.forEach(function(values,index) {
                    response.push({
                      id : values[0].value,
                      title : values[1].value,
                      author : values[2].value,
                      release_year : values[3].value,
                      description : values[4].value,
                      cover_url : values[5].value
                    })
                  });
                  res.send({status: 1, data: response});
                }
              }
            );
            try {
              connection.execSql(request);
            } catch (err) {
              console.log(err)
              res.send({status: 0, message: err});
            }
          }
      }) 
    },
    addCatalogue: function(req, res) {
      let connection = new Connection(config);
      connection.on('connect', err => {
        if (err) {
          console.log(err);
        } else {
          console.log('connected');
          const request = new Request(
            `INSERT INTO dbo.Book (title, author, release_year, description, cover_url)
             VALUES ('${req.body.title}', '${req.body.author}', '${req.body.release_year}', '${req.body.description}', '${req.body.cover_url}')`,
            (err, rowCount) => {
              if (err) {
                console.error(err.message);
                res.send({status: 0, message: err.message});
              } else {
                console.log(`${rowCount} row(s) returned`);
                res.send({status: 1, data: 'OK'});
              }
            }
          );
          try {
            connection.execSql(request);
          } catch (err) {
            console.log(err)
            res.send({status: 0, message: err});
          }
        }
      });    
    }
}

module.exports = {
    ...app
}