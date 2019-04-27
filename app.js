/*There will be 2 types of communication*/
//File communication (Express)
    //Client asks server for a file (Ex: playerImg.png)
    //Takes the format of Domain:Port/filepathOnServer

//Package communication (Socket.io)
    //Client sends data to server (Ex. Input)
    //Server sends data to client (Ex. Monster position)

//Setup Express
const PORT_NUM = 2000;
const FPS = 60;
var express = require("express");
var app = express();
var server = require("http").Server(app);

//When we get the root of the website, send out the index.html
//__dirname is the current directory nodejs is in.
app.get("/", function(request, response) {
    response.sendFile(__dirname + "/client/index.html"); 
});

//Client can only access files in the client folder on the server
app.use("/client", express.static(__dirname + "/client"));

//Set the server to listen on port 2000
server.listen(PORT_NUM);
console.log("Server started.\nListening on Port " + PORT_NUM);

//Array of socket objcects containing details of connected clients
var SOCKET_LIST = {};
var PLAYER_LIST = {};

//Player Constructor
var Player = function(id){
    var self = {
        x:250,
        y:250,
        id:id,
        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,
        maxSpd:5
    }
    self.updatePosition = function(){
        if(self.pressingRight)
            self.x += self.maxSpd;
        if(self.pressingLeft)
            self.x -= self.maxSpd;
        if(self.pressingDown)
            self.y += self.maxSpd;
        if(self.pressingUp)
            self.y -= self.maxSpd;
    }
    return self;
}

//Setup Socket.io
var io = require("socket.io") (server, {});
//Whenever there is a connection this function will be run
io.sockets.on("connection", function(socket) {
    //Give the socket sonnection a unique id and x and y coordinates
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    //Create Player
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;

    //The server can also send a message to clients
    // socket.emit("serverMsg", {
    //     msg:"hello",
    // });

    // Deals with a client diconnecting
    socket.on("disconnect", function(){
        delete SOCKET_LIST[socket.id]
        delete PLAYER_LIST[socket.id]
    });

    // Gets input from movement
    socket.on("keyPress", function(data){
        if(data.inputId === "left")
            player.pressingLeft = data.state;
        if(data.inputId === "right")
            player.pressingRight = data.state;
        if(data.inputId === "up")
            player.pressingUp = data.state;
        if(data.inputId === "down")
            player.pressingDown = data.state;
    });

    // Handles receiving a new chat message
    socket.on("newChatMessage", function(data){
        // Emit the new message to every socket
        for(var i in SOCKET_LIST)
        {
            SOCKET_LIST[i].emit("chatUpdate", data);
        }
    });
});

//Game loop
setInterval(function(){

    clientPackage = [];
    //For every connected client/socket
    for(var i in PLAYER_LIST)
    {
        var player = PLAYER_LIST[i];
        player.updatePosition();
    
        //Just at the x,y object
        clientPackage.push({
            x:player.x,
            y:player.y
        });
    }

    //emit the new coordinates of everyone to the client
    for (var i in  SOCKET_LIST)
    {
        //emit to every client/socket
        var socket = SOCKET_LIST[i];
        socket.emit("newPositions", clientPackage);
    }
   

},1000/FPS);
