CREATE DATABASE IF NOT EXISTS Store;
USE Store;

-- Таблица Customers
CREATE TABLE IF NOT EXISTS Customers (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15),
    Address TEXT
);

-- Таблица Categories
CREATE TABLE IF NOT EXISTS Categories (
    CategoryID INT PRIMARY KEY AUTO_INCREMENT,
    CategoryName VARCHAR(100) NOT NULL
);

-- Таблица Products
CREATE TABLE IF NOT EXISTS Products (
    ProductID INT PRIMARY KEY AUTO_INCREMENT,
    ProductName VARCHAR(100) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Stock INT NOT NULL,
    CategoryID INT,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- Таблица Orders
CREATE TABLE IF NOT EXISTS Orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    OrderDate DATE NOT NULL,
    TotalAmount DECIMAL(10, 2),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Таблица OrderDetails
CREATE TABLE IF NOT EXISTS OrderDetails (
    OrderDetailID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT,
    ProductID INT,
    Quantity INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Таблица Cart
CREATE TABLE IF NOT EXISTS Cart (
    CartID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    ProductID INT,
    Quantity INT NOT NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Заполнение данными
INSERT INTO Customers (Name, Email, Phone, Address) VALUES
('Alice Smith', 'alice@example.com', '1234567890', '123 Main St'),
('Bob Johnson', 'bob@example.com', '0987654321', '456 Elm St');

INSERT INTO Categories (CategoryName) VALUES
('Electronics'),
('Clothing');

INSERT INTO Products (ProductName, Price, Stock, CategoryID) VALUES
('Smartphone', 699.99, 50, 1),
('T-shirt', 19.99, 200, 2);

INSERT INTO Orders (CustomerID, OrderDate, TotalAmount) VALUES
(1, '2024-12-20', 719.98);

INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price) VALUES
(1, 1, 1, 699.99),
(1, 2, 1, 19.99);