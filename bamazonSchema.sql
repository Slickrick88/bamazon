DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;


CREATE TABLE products (
 item_id INT NOT NULL AUTO_INCREMENT UNIQUE,
 product_name VARCHAR(80) NOT NULL,
 dept_name varchar(80) NOT NULL,
 price DECIMAL(10,2) NOT NULL,
 stock integer(10) NOT NULL,
 PRIMARY KEY (item_id),
 index(product_name),
 UNIQUE (item_id)
);

CREATE TABLE login_TBL (
   user_id INT NOT NULL AUTO_INCREMENT UNIQUE,
   passwrd VARCHAR(80) NOT NULL,
   user_name VARCHAR(80) NOT NULL,
   user_type VARCHAR(80) NOT NULL,
   primary key(user_id),
   UNIQUE (user_name)
);

create table deptartments(
    dept_id int not null AUTO_INCREMENT UNIQUE,
    dept_name varChar(80) not null,
    over_head_costs DECIMAL(10,2) NOT NULL,
    primary key(dept_id),
    index(dept_name),
    UNIQUE (dept_id)
);

