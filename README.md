# save-to-drive
Save To Drive is an Script written on Nodejs to upload files of small,medium and Large sizes from the web. You have to provide link and the with the help of request module its just pass the stream to the drive api due to which less memory is consumed and transfer is Done fast

[Working demo](http://savetodrive.me/#)


#Installation
  First Enable API for google Drive
  [Enable Google API](https://console.developers.google.com/apis)
  
  After that get your creditals from google
  also enter the redirect URI's and javascript origin's on your project
    #Authorized JavaScript origins
    For use with requests from a browser. This is the origin URI of the client application. It can't contain a wildcard (http://*.example.com) or a path (http://example.com/subdir). If you're using a nonstandard port, you must include it in the origin URI.
    enter http://localhost:3000 for testing on local server
    Authorized redirect URIs
      For use with requests from a web server. This is the path in your application that users are redirected to after they have authenticated with Google. The path will be appended with the authorization code for access. Must have a protocol. Cannot contain URL fragments or relative paths. Cannot be a public IP address.
      enter http://localhost:3000/token for redirect uri
  
    After you have set up uri's and got creditals no enter the details on client_secret.json file located on root of app
    and the do some command work.
    
    for npm dependencies do
    ```npm install```
    for bower depencied do
    ```bower install```
    
    now do ```npm start``` of error occured and if you have nodemon then do ```nodemon app.js``` or ```node js```
    now from browser goto http://localhost:3000 after that page must be opened and then authenticate app with your google drive and start uploading files...
