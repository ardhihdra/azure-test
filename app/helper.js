
const {  Request } = require('tedious');

const helper = {
    postData: function (req, res, connection) {
    const request = new Request(
      `INSERT INTO dbo.Book (title, author, release_year, description, cover_url)
       VALUES ('${req.body.title}', '${req.body.author}', '${req.body.release_year}', '${req.body.description}', '${req.body.cover_url}')`,
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
  },
  getData: function(req, res, connection) {
    const request = new Request(
      `SELECT TOP (1000) *
      FROM [dbo].[Book]`,
      (err, rowCount, rows) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`${rowCount} row(s) returned`);
          // console.log('listt', rows)
          this.sendData(rows, res)
        }
      }
    );
    try {
      connection.execSql(request);
    } catch (err) {
      console.log(err)
      res.send({msg: 'gagal'});
    }
  },
  sendData: function(list, res) {
    let data = '';
    list.forEach(function(values,index) {
      data += index === 0 ? '<div style="background:rgb(220,220,220);padding: 10px;margin:20px;grid-column-start: 1;grid-column-end: 1;">': '<div style="background:rgb(220,220,220);padding: 10px;margin:20px;">'
      data += `<h2>${values[1].value}, ${values[4].value}</h2>`
      data += `<img src='${values[5].value}' style="width:300px;height:400px;">`
      data += `<h5>${values[2].value} : ${values[3].value}</h5>`
      data += '</div>'
    });
  
    res.send(this.responseLayout(data))
  },
  searchBook: async function(req, res, client, queries) {
    await this.sleep(500);
    await Promise.all(
      queries.map( async query => {
          const result = await client.queryAsync(query);
          const body = await result.json();
          const str = JSON.stringify( body, null, 4);
          console.log(`Query: ${query} \n ${str}`);

          // console.log("body", body)
          let data = '';
          body.value.forEach(function(values,index) {
            data += index === 0 ? '<div style="background:rgb(220,220,220);padding: 10px;margin:20px;grid-column-start: 1;grid-column-end: 1;">': '<div style="background:rgb(220,220,220);padding: 10px;margin:20px;">'
            data += `<h2>${values.title}, ${values.release_year}</h2>`
            data += `<img src='${values.cover_url}' style="width:300px;height:400px;">`
            data += `<h5>${values.author} : ${values.description}</h5>`
            data += '</div>'
          });

          res.send(this.responseLayout(data));
      })
    );
    
  },
  sleep: function(ms) {
    return(
        new Promise(function(resolve, reject) {
            setTimeout(function() { resolve(); }, ms);
        })
    );
  },
  responseLayout(data) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>List of Books</title>
      </head>
      <body>
          <div  align="center">
            <a href="/" >
              <button value="back"/>Back</button>
            </a>
            <div>
              <form method="POST" action="/book/search">
                <input type="text" name="search" placeholder="Find Your Books">
                <button type="submit">Search</button>
              </form>
            </div>
            <div style="display:grid;grid-template-columns: auto auto auto;grid-row-gap: 50px;">          
              ` + data + 
              `
            </div>
          </div>
      </body>
      </html>  
    `
  }
        
}

module.exports = {
    ...helper
}