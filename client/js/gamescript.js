// This is the main game script

var gameContext = document.getElementById("gameView").getContext("2d");
gameContext.font = "30px Arial";
gameContext.imageSmoothingEnabled = false;

// Establishes socket connection to the server
var socket = io();

socket.on("newPositions", function(data){
    //Clear the canvas
    gameContext.clearRect(0,0,1900,950);

    //Display position of everyone
    for (var i=0; i<data.length; i++)
    {
        gameContext.beginPath();
        gameContext.arc(data[i].x, data[i].y, 50, 0, 2 * Math.PI);
        gameContext.fillStyle = "red";
        gameContext.fill();
    }    
});


// Chat
var inputBox = document.getElementById("inputBox");
var chatLog = document.getElementById("chatLog");

// Received a new message from the server add it to the chat logs
socket.on("chatUpdate", function(data){
    var nodeToAdd = document.createElement("div");
    nodeToAdd.innerText = data.message;
    chatLog.appendChild(nodeToAdd);
});


// Handle all keypresses
document.onkeydown = function(event){

    // If the chat box is focused only handle chat input, otherwise handle movement
    if (inputBox === document.activeElement)
    {
        // Chat
        // If the input box has focus and enter is pressed
        if (event.keyCode == 13)
        {
            //Send the text in the textbox to the server
            socket.emit("newChatMessage", {message:inputBox.value});
            // Clear the textbox
            inputBox.value = "";
        }
    }
    else
    {
        // Movement
        if (event.keyCode == 68 || event.keyCode == 39) //d, right
        socket.emit("keyPress", {inputId:"right",state:true});
        if (event.keyCode == 83 || event.keyCode == 40) //s, down
        socket.emit("keyPress", {inputId:"down",state:true});
        if (event.keyCode == 65 || event.keyCode == 37) //a, left
        socket.emit("keyPress", {inputId:"left",state:true});
        if (event.keyCode == 87 || event.keyCode == 38) //w, up
        socket.emit("keyPress", {inputId:"up",state:true});
    }
}

document.onkeyup = function(event){
    if (event.keyCode == 68 || event.keyCode == 39) //d, right
        socket.emit("keyPress", {inputId:"right",state:false});
    if (event.keyCode == 83 || event.keyCode == 40) //s, down
        socket.emit("keyPress", {inputId:"down",state:false});
    if (event.keyCode == 65 || event.keyCode == 37) //a, left
        socket.emit("keyPress", {inputId:"left",state:false});
    if (event.keyCode == 87 || event.keyCode == 38) //w, up
        socket.emit("keyPress", {inputId:"up",state:false});
}

