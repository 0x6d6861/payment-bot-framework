var { users, sessions, accounts, db } = require('./db');

users.insert([
    { name: 'Heri', email: "agape@live.fr", password: "password1"}, 
    { name: 'Peter', email: "peter@mail.com", password: "password2"}
]);

accounts.insert([
    { phonenumber: "254700928129", user: users.findOne({email: "agape@live.fr"}).$loki, amount: 5000, currency: "KES" },
    { phonenumber: "254772369355", user: users.findOne({email: "peter@mail.com"}).$loki, amount: 3850, currency: "KES" }
]);

db.save();