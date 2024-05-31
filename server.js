const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // Import the cors middleware
const jwt = require('jsonwebtoken');

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
    const filteredAuthors = 'Hello';
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
                    const userId = results[0].id;
                    console.log('@here REST ', results[0].id)

                    console.log('@here userId ', userId)
                    connection.query('SELECT * FROM userprofiles WHERE userId = ?;', [userId], (err, results) => {
                        console.log('@here Login successfu ', results)
                        res.json({ message: 'Login successful ', user: results[0] });
                    })

                } else {
                    res.status(201).json({ message: 'Incorrenct Password' });
                }

            })
        } else {
            res.status(202).json({ message: 'User Not exsit' });
        }

    });
});

const user = { name: 'testuser' }; // Sample payload


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        res.status(201).json({ message: 'Authorization required..' }); // Unauthorized
    }
    else {
        jwt.verify(token, 'Test', (err, user) => {
            if (err) {
                res.status(403).json({ message: 'Invalid token..' }); // Forbidden
            } else {
                req.user = user;

                next()
            }
        });
    }

};

app.post('/getProfile', authenticateToken, (req, res) => {
    const { userId } = req.body;
    // Query MySQL for user with matching userId
    connection.query('SELECT * FROM userprofiles WHERE userId = ?;', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        console.log('@By User Id: ', results);

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(202).json({ message: 'User Not exist' });
        }
    });
});

app.post('/signup', (req, res) => {
    const { email, password, name, phonenumber } = req.body;
    // Query MySQL for user with matching username and password
    let newId = 0
    connection.query('SELECT * FROM Persons', [], (err, results) => {
        console.log('@By all data: ', JSON.stringify(results, null, 2))

        if (results.length > 0) {
            const lastuser = results[results.length - 1]
            newId = lastuser.id + 1
            console.log('@By New Id ', JSON.stringify(newId, null, 2))

            if (newId > 0) {
                connection.query('INSERT INTO Persons (email, password, id) VALUES (?, ?, ?)', [email, password, newId], (err, results) => {
                    console.log('@By Sign up query: ', results)

                    connection.query('INSERT INTO userprofiles (userId, name, dob, technology, phonenumber) VALUES (?, ?, ?, ?, ?)', [newId, name, null, null, phonenumber], (err, results) => {
                        if (err) {
                            res.status(202).json({ message: 'Error in creating profile' });
                            res.json({ message: 'Sign Up Successfully done' })
                        } else {
                            res.json({ message: 'Sign Up Successfully done' })

                        }
                    });

                });
            } else {
                res.status(202).json({ message: 'Something went wrong.' });
            }
        } else {
            res.status(202).json({ message: 'Error in singup' });
        }

    });



});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
