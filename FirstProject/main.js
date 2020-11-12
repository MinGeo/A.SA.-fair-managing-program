var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {
  HTML:function(list, control){
    return `
    <!doctype html>
    <html>
    <head>
      <title>A.SA. Fair Manager</title>
      <meta charset = "utf-8">
    </head>
    <body>
      <h1><a href="/">A.SA. Fair Manager</a></h1>

      ${list}
      ${control}
    </body>
    </html>
    `;
  }, list:function(filelist){
    var list = '<ul>';
    var i = 0;
    while(i < filelist.length){
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i+1;
    }
    list = list + '</ul>';
    return list;
  }
}
var app = http.createServer(function(request, response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if(pathname === '/'){
    if(queryData.id === undefined){
      fs.readdir('./page', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var list = template.list(filelist);
          var html = template.HTML(list, `<a href="/create">create</a>`);
            response.writeHead(200);
            response.end(html);
        });
       });
     }

   }
   else if(pathname ==='/create'){
     fs.readdir('./page', function(error, filelist){
       fs.readFile(`page/${queryData.id}`, 'utf8', function(err, description){
         var title = queryData.id;

         var html = template.HTML('',`
          <form action="/create_event" method = "post">
            <p>
              <input type = "text" name="title" placeholder="title">
            </p>
              <p>
                <input type="submit">
              </p>
          </form>
         `);
         response.writeHead(200);
         response.end(html);
       });
     });
   }
   else if(pathname === '/create_event'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var title = post.title;
      fs.mkdir(`./${title}data`, function(err){
        if(err) {
          console.log(err);
        }
        else{
          console.log("New directory created.");
        }
        fs.writeFile(`page/${title}`, 'utf8', function(err){
          response.writeHead(302, {Location: `/`});
          response.end();
        })
      })

    });

   }


});
app.listen(4000);
