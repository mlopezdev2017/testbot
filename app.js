var restify = require("restify");
var builder = require("botbuilder");

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

//Configure bot default Locale as Spanish
var bot = new builder.UniversalBot(connector, {
    localizerSettings: { 
        defaultLocale: "es",
        botLocalePath: "./locale" 
    }
});

//Main dialog
bot.dialog("/", [
    //Locale picker
    function (session) {
        session.beginDialog('/localePicker');
    },
    //Specific data dialog
    function (session) {
        session.send("greeting");
        session.beginDialog('/crediData');
    },
]);

var AvailableLanguages = {
    English: "English",
    Espanol: "Español"
};

//Locale picker dialog
bot.dialog('/localePicker', [
    function (session) {
        // prompt for search option
        builder.Prompts.choice(
            session,
            "What's your preferred language?",
            [AvailableLanguages.English, AvailableLanguages.Espanol],
            {
                maxRetries: 3,
                retryPrompt: "Not a valid option"
        });
    },
    function (session, results) {
        // Update preferred locale
        var locale;
        switch (results.response.entity) {
            case "English":
                locale = 'en';
                break;
            case "Español":
                locale = 'es';
                break;
        }
        session.preferredLocale(locale, function (err) {
            if (!err) {
                session.send("lang_preferred_language", results.response.entity);
                // Locale files loaded
                session.endDialog();
            } else {
                // Problem loading the selected locale
                session.error(err);
            }
        });
    }
]);

//Locale picker dialog
bot.dialog('/crediData', [
    function (session) {
        session.dialogData.userData = {};
        session.dialogData.titleData = {};
        session.dialogData.titleUserData = {};
        session.dialogData = botFunctions.PrepareDialogTitles(session);
        //Prompt for id number
        builder.Prompts.text(session, session.dialogData.titleData.idNumber);
    },
    function (session, results) {
        //Store Id. Number and prompt for type income
        session.dialogData.userData.idNumber = results.response;
        builder.Prompts.text(session, session.dialogData.titleData.typeIncome);
    },
    function (session, results) {
        //Store type of income. Number and prompt for income amount
        session.dialogData.userData.typeIncome = results.response;
        builder.Prompts.number(session, session.dialogData.titleData.incomeAmount);
    },
    function (session, results) {
        //Store income amount. 
        session.dialogData.userData.incomeAmount = results.response;

        //Display session data
        for (var key in session.dialogData.userData) {
            if (session.dialogData.userData.hasOwnProperty(key))
                session.send(session.dialogData.titleUserData[key] + ": " + session.dialogData.userData[key]);
        }

        builder.Prompts.confirm(session, "user_data_verification");
    },
    function (session, results) {
        if (results.response) {
            session.endDialog("system_processing");
        }
        else {
            session.endDialog("system_retry");
            session.beginDialog('/crediData');
        }
    }
]);

var botFunctions = {};

botFunctions.PrepareDialogTitles = function(session) {
    var dialogData = session.dialogData;
    dialogData.titleUserData = {
        idNumber: session.localizer.gettext(session.preferredLocale(), "user_data_id_number"),
        typeIncome: session.localizer.gettext(session.preferredLocale(), "user_data_type_income"),
        incomeAmount: session.localizer.gettext(session.preferredLocale(), "user_data_income_amount")
    };

    //Generate titleData
    dialogData.titleData = {};
    for (var key in dialogData.titleUserData) {
        if (dialogData.titleUserData.hasOwnProperty(key))
            dialogData.titleData[key] = session.localizer.gettext(session.preferredLocale(), "user_data_request_base") + dialogData.titleUserData[key];
    }

    return dialogData;
};