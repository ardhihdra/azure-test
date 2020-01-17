var express = require('express');
var router = express.Router();
const { Connection, Request } = require('tedious');
// create connection
const config = {
  authentication: {
      options: {
          userName: 'ardhihdra',
          password: 'password123!'
      },
      type: 'default'
  },
  server: 'submission1appserver.database.windows.net',
  options: {
      database: 'submission1db',
      encrypte: true,
      rowCollectionOnRequestCompletion: true
  }   
};   


/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html', {root: './views' }); // __dirname   
  // res.render('index', { title: 'Express' });
});

router.post('/user/new', function(req, res) {   
  let connection = new Connection(config);
  connection.on('connect', err => {
      if (err) {
        console.log(err);
      } else {
        console.log('connected');
        postData(req, res, connection);
      }
  })
});

router.get('/users', function(req, res) {
  let list = ``;
  let connection = new Connection(config);
  connection.on('connect', err => {
      if (err) {
        console.log(err);
      } else {
        console.log('connected');
        getData(req, res, connection);
      }
  })
  
});


function postData(req, res, connection) {
  const request = new Request(
    `INSERT INTO dbo.hobbies (name, hobby)
     VALUES ('${req.body.name}', '${req.body.hobby}')`,
    (err, rowCount) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) returned`);
      }
    }
  );
  try {
    connection.execSql(request);
    res.sendFile('index.html', {root: './views' });
  } catch (err) {
    console.log(err)
    res.send({msg: 'gagal'});
  }
}

function getData(req, res, connection) {
  const request = new Request(
    `SELECT TOP (10) [name]
    ,[hobby]
    FROM [dbo].[hobbies]`,
    (err, rowCount, rows) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) returned`);
        console.log('listt', rows)
        sendData(rows, res)
      }
    }
  );
  try {
    connection.execSql(request);
  } catch (err) {
    console.log(err)
    res.send({msg: 'gagal'});
  }
}

function sendData(list, res) {
  let data = '';
  list.forEach(function(values,index) {
    data += '<div>'
    values.forEach(function (value, index) {
      console.log(JSON.stringify(value))
      data += value.value
    })
    data += '</div>'
  })

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>List of Hobbies</title>
    </head>
    <body>
        <div  align="center">
        <form action="/" method="get">
          <input type="submit" value="back"/>
        </form> 
            ` + data + 
            `
        </div>
    </body>
    </html>  
  `)
}
module.exports = router;
