# Payment app with bot-framework
Payment system implementation with Microsoft's Bot Framework purely in NodeJs. This is just a prooof of concept, only use it as a boilerplate for your project. 

Before anything, you need to have **Microsoft Bot Framework Emulator** installed which you can get from 
[this link](https://github.com/Microsoft/BotFramework-Emulator, "Microsoft Bot Framework Emulator")

**Set up**
```bash
git clone https://github.com/heriagape/bot-framework.git
cd bot-framework && npm install # Install app dependencies
npm start # To run the bot framework server
npm run server # To run the web authentication endpoints
```

**Usage**

You are ready to setup the Bot Framework, everythin should run with the default settings otherwise the settup seting will be logged in the terminal.
You can start off with the provided users bellow, make note of the passwords. If asked about PIN just use **4444**
```javascript
[
    { name: 'Heri', email: "agape@live.fr", password: "password1"}, 
    { name: 'Peter', email: "peter@mail.com", password: "password2"}
]
```
