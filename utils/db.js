var loki = require('lokijs');

// var db = new loki('database.json');
var db = new loki();
var users = db.addCollection('users');
var accounts = db.addCollection('accounts');
var sessions = db.addCollection('sessions');


users.insert([
    { name: 'Heri', email: "agape@live.fr", password: "password1"}, 
    { name: 'Peter', email: "peter@mail.com", password: "password2"}
]);

accounts.insert([
    { phonenumber: "254700928129", user: users.findOne({email: "agape@live.fr"}).$loki, amount: 5000, currency: "KES" },
    { phonenumber: "254772369355", user: users.findOne({email: "peter@mail.com"}).$loki, amount: 3850, currency: "KES" }
]);

db.save();

module.exports = {
    db: db,
    users: users,
    accounts: accounts,
    sessions: sessions
}

