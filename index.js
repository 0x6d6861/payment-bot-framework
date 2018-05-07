var restify = require('restify');
var builder = require('botbuilder');

var axios = require('axios');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
/* var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
}); */

var connector = new builder.ChatConnector({
    appId: "",
    appPassword: ""
});




// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')



var inMemoryStorage = new builder.MemoryBotStorage();

var menuItems = { 
    "Send Moaney": {
        item: "/sendmoney"
    },
    "Withdraw Cash": {
        item: "/withdraw"
    },
    "My Account": {
        item: "/account",
        submenu: {
            "Account Balance": {
                item: "/account/balance"
            },
            "Mini Statement": {
                item: "/account/ministatement"
            },
            "Change PIN": {
                item: "/account/changepassword"
            }
        }
    },
    "Help": {
        item: "/help"
    },
}

var bot = new builder.UniversalBot(connector, function (session) {
    session.send("Hi, Welcome to my superPesa");
    session.beginDialog("mainMenu");
});

// Display the main menu and start a new request depending on user input.
bot.dialog("mainMenu", [
    function(session){
        builder.Prompts.choice(session, "Main Menu:", menuItems, { listStyle: builder.ListStyle.button });

    },
    function(session, results){
        if(results.response){
            session.beginDialog(menuItems[results.response.entity].item);
        }
    }
])
.triggerAction({
    // The user can request this at any time.
    // Once triggered, it clears the stack and prompts the main menu again.
    matches: /^main menu$/i,
    confirmPrompt: "This will cancel your request. Are you sure?"
});

// ====== SENDING MONEY DIALOG ======
bot.dialog('/sendmoney', [
    function (session) {
        session.send("In this section you can send money to a phone number");
        session.beginDialog('askForNumber');
    },
    function (session, results) {
        session.dialogData.phoneNumber = results.response;
        session.send(`How much would you like to send to ${results.response}?`)
        session.beginDialog('askForAmount');
    },
    function (session, results) {
        session.dialogData.amount = results.response;
        session.beginDialog('askForPIN');
    },
    function (session, results) {
        session.dialogData.PIN = results.response;
        // Process request and display reservation details
        session.send(`You are about to send KSH ${session.dialogData.amount} to ${session.dialogData.phoneNumber}`);
        builder.Prompts.confirm(session, "Are you sure you want to continue?", { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        session.sendTyping();
        if(results.response){
            console.log(session.dialogData);
            if(session.dialogData.PIN == "4444"){
                session.send("Transaction Conpleted successfully"); 
            }else{
                session.send("Transaction faild, invalide PIN provided")
            }
            
        }else{
            session.send("Transaction has been cancelled");
        }

        session.endDialog(); // ends the dialog
    }
])
.endConversationAction(
    "endSendMoney", "Ok. Goodbye.",
    {
        matches: /^cancel$|^quit$/i,
        confirmPrompt: "This will cancel this transaction. Are you sure?"
    }
)
.triggerAction({ matches: /^(send|transfer)/i });;
// ====== SENDING MONEY DIALOG ======


// ====== WITHDRAW MONEY DIALOG ======
bot.dialog('/withdraw', [
    function (session) {
        session.send('How much would you like to withdraw?')
        session.beginDialog('askForAmount');
    },
    function (session, results) {
        session.dialogData.amount = results.response;
        session.beginDialog('askForPIN');
    },
    function (session, results) {
        session.dialogData.PIN = results.response;
        // Process request and display reservation details
        session.send(`Are you sure you want to withdraw KSH ${session.dialogData.amount} from your account?`);
        builder.Prompts.confirm(session, "Are you sure you want to continue?", { listStyle: builder.ListStyle.button });
    },
    function (session, results) {

        if(results.response){
            console.log(session.dialogData);
            if(session.dialogData.PIN == "4444"){
                session.send("Transaction Conpleted successfully"); 
            }else{
                session.send("Transaction faild, invalide PIN provided")
            }
            
        }else{
            session.send("Transaction has been cancelled");
        }

        session.endDialog(); // ends the dialog
    }
])
.endConversationAction(
    "endSendMoney", "Ok. Goodbye.",
    {
        matches: /^cancel$|^quit$/i,
        confirmPrompt: "This will cancel this transaction. Are you sure?"
    }
)
.triggerAction({ matches: /^(withdraw)/i });;
// ====== WITHDRAW MONEY DIALOG ======


// ====== ACCOUNT MONEY DIALOG ======
bot.dialog('/account', [
    function(session){
        builder.Prompts.choice(session, "Main Menu:", menuItems['My Account'].submenu, { listStyle: builder.ListStyle.button });

    },
    function(session, results){
        if(results.response){
            session.beginDialog(menuItems['My Account'].submenu[results.response.entity].item);
        }
    },
    // function (session, results) {

    //     if(results.response){
    //         console.log(session.dialogData);
    //         if(session.dialogData.PIN == "4444"){
    //             session.send("Transaction Conpleted successfully"); 
    //         }else{
    //             session.send("Transaction faild, invalide PIN provided")
    //         }
            
    //     }else{
    //         session.send("Transaction has been cancelled");
    //     }

    //     session.endDialog(); // ends the dialog
    // }
])
.endConversationAction(
    "endSendMoney", "Ok. Goodbye.",
    {
        matches: /^cancel$|^quit$/i,
        confirmPrompt: "This will cancel this transaction. Are you sure?"
    }
);

bot.dialog('/account/balance', [
    function(session){

        session.send('You need to login first to contunue?')

        var logincard = new builder.SigninCard(session)
        .text('To Proceed you need to login to our system')
        .button('Sign-in', 'http://localhost:3000/login');

        var msg = new builder.Message(session).addAttachment(logincard);
        session.send(msg);
        builder.Prompts.text(session, "Click on login then enter code bellow");
    },
    function (session, results, next) {
        // console.log("logging", "Hello, world!")
        if(results.response){
            var loginResponse = results.response;
            session.userData.loginCode = loginResponse;
            session.sendTyping();
            axios.post('http://localhost:3000/getuser', { code: session.userData.loginCode })
            .then(function (Response) {
                if (Response.data.success) {
                    session.userData.user = Response.data.user; // Save user datails.
                    // session.endDialogWithResult(results);
                    //session.endDialogWithResult({ response: Response.data.user });
                    next();
                } else {
                    // Repeat the dialog
                    session.send("Invalide login, try again!")
                    session.replaceDialog('/account/balance', { reprompt: true });
                }

                //console.log(response);
            })
            .catch(function (error) {
                session.send(error.message);
                session.replaceDialog('/account/balance', { reprompt: true });
                console.log(error);
            });
        }
        
        
    },
    function (session, results) {
        axios.post('http://localhost:3000/getuser/balance', { email: session.userData.user.email })
        .then(function(account){
            console.log(account);
            session.endDialog(`Welcome ${session.userData.user.name}<br>Account Balance: ${account.data.currency} ${account.data.amount}`)
        })
        .catch(function (error) {
            session.send(error.message);
            session.replaceDialog('/account/balance', { reprompt: true });
            console.log(error);
        });
    }
]).triggerAction({
    // The user can request this at any time.
    // Once triggered, it clears the stack and prompts the main menu again.
    matches: /^account menu$/i,
    confirmPrompt: "This will cancel your request. Are you sure?"
});;



// ====== ACCOUNT MONEY DIALOG ======





// This dialog prompts the user for a phone number. 
// It will re-prompt the user if the input does not match a pattern for phone number.
bot.dialog('askForNumber', [
    function (session, args) {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Enter the number using a format of either: '+254700928129' or '0700928129'")
        } else {
            builder.Prompts.text(session, "What's the recipeint's phone number?");
        }
    },
    function (session, results) {
        var matched = results.response.match(/\d+/g);
        var number = matched ? matched.join('') : '';
        if (number.length == 10 || number.length == 13) {
            session.userData.phoneNumber = number; // Save the number.
            session.endDialogWithResult(results);
            // session.endDialogWithResult({ response: number });
        } else {
            // Repeat the dialog
            session.replaceDialog('askForNumber', { reprompt: true });
        }
    }
]);

bot.dialog('askForAmount', [
    function (session) {
        builder.Prompts.number(session, "Please enter the amount to send.");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('askForPIN', [
    function (session) {
        builder.Prompts.text(session, "Please enter your pin or password.");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);









// Add dialog to return list of shirts available
bot.dialog('showShirts', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
            .title("Classic White T-Shirt")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            .images([builder.CardImage.create(session, 'https://5.imimg.com/data5/IW/BW/MY-8481883/white-t-shirt-500x500.jpg')])
            .buttons([
                builder.CardAction.imBack(session, "buy classic white t-shirt", "Buy")
            ]),
        new builder.HeroCard(session)
            .title("Classic Gray T-Shirt")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            .images([builder.CardImage.create(session, 'data:image/jpeg;base64,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')])
            .buttons([
                builder.CardAction.imBack(session, "buy classic gray t-shirt", "Buy")
            ])
    ]);
    session.send(msg).endDialog();
}).triggerAction({ matches: /^(show|list)/i });