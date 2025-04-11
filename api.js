const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 8001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let db = new sqlite3.Database('./students.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the students database.');
});

app.get('/students', (req, res) => {
    const sql = 'SELECT * FROM students';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/students', (req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    const sql = 'INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)';
    
    db.run(sql, [firstname, lastname, gender, age], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: `Student with id: ${this.lastID} created successfully` });
    });
});

app.get('/student/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM students WHERE id = ?';
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(row);
    });
});

app.put('/student/:id', (req, res) => {
    const id = req.params.id;
    const { firstname, lastname, gender, age } = req.body;
    const sql = 'UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?';
    
    db.run(sql, [firstname, lastname, gender, age, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({
            id: id,
            firstname: firstname,
            lastname: lastname,
            gender: gender,
            age: age
        });
    });
});

app.delete('/student/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM students WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: `The Student with id: ${id} has been deleted.` });
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});