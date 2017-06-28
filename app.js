var restify = require("restify");
var builder = require("botbuilder");
var bot = require("./botFunctions");

//Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log("%s listening to %s", server.name, server.url);
});

//Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: "57e5fddb-3e46-4399-9877-633ad73e50cf",
    appPassword: "0ziNE7Y5OMKgcm2Wm8eiL15"
    // appId: process.env.MICROSOFT_APP_ID,
    // appPassword: process.env.MICROSOFT_APP_PASSWORD
});

//Listen for messages from users
server.post("/api/messages", connector.listen());

//Init bot
bot.functions.InitBot(connector);