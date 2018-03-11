
DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products(
    id INT NOT NULL AUTO_INCREMENT,
    item_id VARCHAR (20),
    product_name VARCHAR(40) NOT NULL,
    department_name VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    stock_quantity INTEGER,
    low_quantity_level INTEGER,
    product_sales DECIMAL(10,2) DEFAULT 0,
    PRIMARY KEY (id)
);


CREATE TABLE departments(
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(20) NOT NULL,
    over_head_costs DECIMAL(10,2) DEFAULT 0,
    PRIMARY KEY (department_id)
);


CREATE TABLE audits(
    audit_id INT NOT NULL AUTO_INCREMENT,
    audit_date INT,   
    audit_type VARCHAR(10),
    item_id VARCHAR(10),
    product_name VARCHAR(40),
    department_name VARCHAR(20),
    price DECIMAL(10,2) DEFAULT 0,
    stock_quantity INTEGER,
    low_quantity_level INTEGER,
    product_sales DECIMAL(10,2) DEFAULT 0,
    over_head_costs DECIMAL(10,2) DEFAULT 0,
    PRIMARY KEY (audit_id)
);


CREATE TABLE orders(
    order_id INT NOT NULL AUTO_INCREMENT,
    order_date INT,
    item_id VARCHAR(10),
    product_name VARCHAR(40),
    department_name VARCHAR(20),
    price DECIMAL(10,2) DEFAULT 0,
    qty_to_buy INTEGER,
    PRIMARY KEY (order_id)
);


