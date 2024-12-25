document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('registration').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        loadProducts();
        loadCart();
    } else {
        document.getElementById('login').style.display = 'block';
        document.getElementById('registration').style.display = 'block';
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            alert('Registration successful!');
            document.getElementById('registerForm').reset();
            document.getElementById('registration').style.display = 'none';
            document.getElementById('login').style.display = 'block';
        } else {
            alert('Error during registration');
        }
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('authToken', token);

            alert('Login successful!');
            document.getElementById('loginForm').reset();
            document.getElementById('login').style.display = 'none';
            document.getElementById('registration').style.display = 'none';
            document.getElementById('content').style.display = 'block';
            loadProducts();
            loadCart();
        } else {
            alert('Error during login');
        }
    } catch (error) {
        console.error(error);
    }
});

const loadProducts = async () => {
    try {
        const response = await fetch('http://localhost:3000/products', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const products = await response.json();
        const tableBody = document.querySelector('#productsTable tbody');
        tableBody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.ProductName}</td>
                <td>${product.Price}</td>
                <td>${product.Stock}</td>
                <td><button onclick="addToCart(${product.ProductID}, 1)">Add to Cart</button></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
    }
};

const addToCart = async (productId, quantity) => {
    try {
        const response = await fetch('http://localhost:3000/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ productID: productId, quantity })
        });
        if (response.ok) {
            alert('Product added to cart!');
            loadCart();
        }
    } catch (error) {
        alert('Error adding product to cart');
    }
};

const loadCart = async () => {
    try {
        const response = await fetch('http://localhost:3000/cart', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const cartItems = await response.json();
        const tableBody = document.querySelector('#cartTable tbody');
        tableBody.innerHTML = '';
        cartItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.ProductName}</td>
                <td>${item.Quantity}</td>
                <td>${item.Price}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
    }
};

document.querySelector('#orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:3000/orders', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (response.ok) {
            alert('Order placed!');
            loadCart();
        }
    } catch (error) {
        alert('Error placing order');
    }
});

document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    document.getElementById('content').style.display = 'none';
    document.getElementById('login').style.display = 'block';
    document.getElementById('registration').style.display = 'block';
});