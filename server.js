const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'store'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Database connection established');
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const JWT_SECRET = 'your_jwt_secret';

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO Customers (Name, Email, Password) VALUES (?, ?, ?)';
        await db.promise().query(query, [name, email, hashedPassword]);

        res.status(201).send('User registered successfully');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).send('Email already exists');
        } else {
            console.error(err);
            res.status(500).send('Error registering user');
        }
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        const query = 'SELECT * FROM Customers WHERE Email = ?';
        const [rows] = await db.promise().query(query, [email]);

        if (rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.Password);

        if (isMatch) {
            const token = jwt.sign({ userId: user.CustomerID }, JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ message: 'Login successful', token });
        } else {
            return res.status(401).send('Invalid password');
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Error during login');
    }
});

app.get('/products', async (req, res) => {
    const query = 'SELECT * FROM Products';
    try {
        const [results] = await db.promise().query(query);
        res.json(results);
    } catch (err) {
        res.status(500).send('Error fetching products.');
    }
});

app.post('/cart', async (req, res) => {
    const { productID, quantity } = req.body;
    if (!productID || !quantity) {
        return res.status(400).send('Required fields are missing');
    }
    const query = 'INSERT INTO Cart (ProductID, Quantity) VALUES (?, ?)';
    try {
        await db.promise().query(query, [productID, quantity]);
        res.status(201).send('Product added to cart');
    } catch (err) {
        res.status(500).send('Error adding product to cart');
    }
});

app.get('/cart', async (req, res) => {
    const query = `
        SELECT Cart.Quantity, Products.ProductName, Products.Price
        FROM Cart
        JOIN Products ON Cart.ProductID = Products.ProductID`;
    try {
        const [results] = await db.promise().query(query);
        res.json(results);
    } catch (err) {
        res.status(500).send('Error fetching cart');
    }
});

app.post('/orders', async (req, res) => {
    try {
        const queryCart = `
            SELECT Cart.Quantity, Products.ProductID, Products.Price
            FROM Cart
            JOIN Products ON Cart.ProductID = Products.ProductID`;
        const [cartItems] = await db.promise().query(queryCart);

        if (cartItems.length === 0) {
            return res.status(400).send('Cart is empty');
        }

        let totalAmount = 0;
        for (const item of cartItems) {
            totalAmount += item.Quantity * item.Price;
        }

        const orderDate = new Date().toISOString().split('T')[0];
        const queryOrder = 'INSERT INTO Orders (OrderDate, TotalAmount) VALUES (?, ?)';
        const [orderResult] = await db.promise().query(queryOrder, [orderDate, totalAmount]);

        const orderId = orderResult.insertId;
        for (const item of cartItems) {
            const updateStockQuery = 'UPDATE Products SET Stock = Stock - ? WHERE ProductID = ?';
            await db.promise().query(updateStockQuery, [item.Quantity, item.ProductID]);

            const orderDetailQuery = 'INSERT INTO OrderDetails (OrderID, ProductID, Quantity) VALUES (?, ?, ?)';
            await db.promise().query(orderDetailQuery, [orderId, item.ProductID, item.Quantity]);
        }

        const deleteCartQuery = 'DELETE FROM Cart';
        await db.promise().query(deleteCartQuery);

        res.status(201).send('Order placed'); 
    } catch (err) {
        console.error('Error placing order:', err); 
        res.status(500).send('Error placing order'); 
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});