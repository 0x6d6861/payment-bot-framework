const express = require('express')
const app = express()
const bodyParser = require('body-parser');
var path    = require("path");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));

var { db, users, sessions, accounts } = require('./utils/db');


app.get('/', (req, res) => {
    res.json(sessions.find());
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname+'/views/login.html'));
})

app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    var user = users.findOne({ email:email, password: password });

    if(user){
        var LoginCode = Math.floor(1000 + Math.random() * 9000);
        sessions.findAndRemove({ user: users.findOne({email: email}).$loki });
        var session = sessions.insert({ user: users.findOne({email: email}).$loki, code: LoginCode });
        res.json({
            success: true,
            message: "successful login",
            code: LoginCode
        });
        db.save();
    }else{
        res.json({
            success: false,
            message: "invalid login details"
        });
    }
    // console.log(req.body);
});

app.post('/sendmoney', (req, res) => {
    console.log(req.body);
});

app.post('/withdaw', (req, res) => {
    
    console.log(req.body);
});

app.post('/getuser', (req, res) => {
    var session = sessions.findOne({ code: Number(req.body.code) });
    console.log(session.user);
    if(session){
        var user = users.findOne({ $loki: session.user});
        res.json({
            success: true,
            user: user
        })
    }else{
        res.json({
            success: false,
            message: "invalid verification code"
        })
    }
});

app.post('/getuser/balance', (req, res) => {
    var account = accounts.findOne({ user: Number(users.findOne({email: req.body.email}).$loki) });
    if(account){
        res.json(account)
    }else{
        res.json({
            success: false,
            message: "invalid verification account"
        })
    }
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))