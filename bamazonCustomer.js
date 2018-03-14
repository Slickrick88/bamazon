var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazondb"
});

//Connect to db
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    userPrompt();
});

//prompt user new or existing
function userPrompt() {
    inquirer
        .prompt({
            name: "userID",
            type: "rawlist",
            message: "Log in or create user",
            choices: ["Login", "Create"]
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.userID === "Login") {
                getLogin();
            }
            else {
                setupUser();
            }
        });
}

//let user log in
function getLogin() {
    //prompt for login
    inquirer
        .prompt([
            {
                name: "login",
                type: "input",
                message: "UserID"

            },
            {
                name: "password",
                type: "password",
                message: "Password"

            }
        ])

        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            var loginQ = "SELECT * FROM login_tbl WHERE user_name = ? AND passwrd= ? AND User_type =?"
            connection.query(loginQ, [answer.login, answer.password, "Customer"], function (err, results) {
                if (err) {
                    console.log("Login in not found. error: " + err);
                    userPrompt();
                } else {
                    console.log("login accepted");
                    // once you have the items, prompt the user for which they'd like to bid on
                    displayProducts()
                };
            })
        });
}

// display all products
function displayProducts() {
    // query the database for all items that are listed for sale
    connection.query("SELECT * FROM products", function (err, items) {
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to purchase
        inquirer
            .prompt([
                {
                    name: "custChoice",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        var objectArray = [];
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i].product_name;
                            var obj = {
                                Item_id: items[i].item_id,
                                Product: items[i].product_name,
                                Department:  items[i].dept_name,
                                Price: items[i].price,
                                Stock_qty: items[i].stock
                            };
                            //can I push the choices up as an object or should I just requery?
                            choiceArray.push(item);
                            objectArray.push(JSON.stringify(obj));

                        }
                        return objectArray;
                    },
                    message: "Please select an item to purchase?"
                },
                {
                    name: "qty",
                    type: "input",
                    message: "How many would you like purchase?"
                }
            ])
            .then(function (answer) {
                var lookup = JSON.parse(answer.custChoice)
                // check if qty wanted > qty on hand
                connection.query("SELECT item_id, stock FROM products WHERE item_id = ?", [lookup.Item_id], function (err, data, fields) {
                    if (err) throw err;
                    if (parseInt(data[0].stock) < parseInt(answer.qty)) {
                        console.log("there is insufficient stock to execute your order.\n Please adjust and try again");
                        displayProducts();
                    } else {
                        var newTotal = parseInt(data[0].stock) - parseInt(answer.qty);
                        UpdateQty(data[0].item_id, newTotal);
                    }
                })
            });
    });
};

//setup a new user
function setupUser() {
    inquirer
        .prompt([
            {
                name: "uLogin",
                type: "input",
                message: "select User Name"
            },
            {
                name: "uPassword",
                type: "input",
                message: "Select Password"
            }
        ])
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            var loginQ = "SELECT user_name FROM login_tbl WHERE ? "
            connection.query(loginQ, { user_name: answer.uLogin }, function (err, results) {
                if (results.length === 0) {
                    connection.query("INSERT INTO login_tbl (user_name, passwrd, user_type ) values (?, ?, ?)", [answer.uLogin, answer.uPassword, "Customer"], function (err, res2) {
                        if (err) throw err;
                        console.log("Account Setup");
                        userPrompt();
                    })
                } else {
                    console.log("UserName is already taken please select a diffent name");
                    // once you have the items, prompt the user for which they'd like to bid on
                    userPrompt();
                };
            })
        });
};

//after a purchase is made update remaining qty
function UpdateQty(id, number) {
    connection.query("update products set stock =  ? WHERE item_id = ?", [number, id], function (err, res) {
        if (err) throw err;
        console.log("order placed. Please visit us again");
        displayProducts()
    });
};
