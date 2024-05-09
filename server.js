const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // Import the cors middleware

const app = express();

app.use(bodyParser.json());
app.use(cors()); // Use the cors middleware to allow all origins

const users = [
    { id: 1, username: 'user1@gmail.com', password: 'password1' },
    { id: 2, username: 'user2@gmail.com', password: 'password2' }
];

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'dev',
    password: '123456',
    database: 'devdb'
});


// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.get('/authors', (req, res) => {
    const filteredAuthors = 'user';
    res.json(filteredAuthors);
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Query MySQL for user with matching username and password
    connection.query('SELECT * FROM Persons WHERE Email = ?;', [username], (err, results) => {
        const emailRes = results
        console.log('@fires email ', results)

        if (results.length > 0) {

            connection.query('SELECT * FROM Persons WHERE Email = ? AND Password = ?;', [username, password], (err, results) => {
                console.log('@fires password ', results)
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    res.status(500).json({ message: 'Internal server error' });
                    return;
                }
                // Check if a user was found
                if (results.length > 0) {
                    res.json({ message: 'Login successful', user: results[0] });
                } else {
                    res.status(201).json({ message: 'Incorrenct Password' });
                }

            })
        } else {
            res.status(202).json({ message: 'User Not exsit' });
        }

    });
});

app.post('/getProfile', (req, res) => {
    const { userId } = req.body;
    // Query MySQL for user with matching username and password
    connection.query('SELECT * FROM userprofiles WHERE userId = ?;', [userId], (err, results) => {
        console.log('@By User Id: ', results)

        if (results.length > 0) {

            res.json(results[0])
        } else {
            res.status(202).json({ message: 'User Not exsit' });
        }

    });
});

// app.post('/login', (req, res) => {
//     const { username, password } = req.body;
//     const user = users.find(user => user.username === username && user.password === password);
//     const userExsit = users.find(user => user.username === username);
//     if (user) {
//         res.json({ message: 'Login successful', user });
//     } else if (userExsit) {
//         res.status(201).json({ message: 'Incorrect Password' });
//     } else {
//         res.status(201).json({ message: 'Invalid username or password' });
//     }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
