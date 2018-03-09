
//Bamazon Manager file

//bamazonManager.js
var mySQL = require('mysql');
var inquirer = require("inquirer");
var Table = require('cli-table');
var numeral = require('numeral');

var cmdParam = "";



//var numeral = new Numeral();

//variable for connection
var sqlConnection = mySQL.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});


//make the connection to the mySQL
// connect to the mysql server and sql database
sqlConnection.connect(function (err) {
    if (err) throw err;
    console.log("connection is made");
    // run the start function after the connection is made to prompt the user
    start();
});


//function display all products
var dispAllProducts_start = function () {
    //no input, just blast out the files
    console.log("\nAll products in inventory");
    sqlConnection.query("SELECT * FROM bamazon_db.products", function (error, data) {
        dispProducts_found(error, data);
    });
};


//products were found by the query
var dispProducts_found = function (error, data) {
    //first check if there was an error
    var table = new Table({
        head: ["Item", "Product name", "Department", "Price", "Qty", "Low\nlevel"],
        colWidths: [15, 42, 20, 15, 8, 8]
    });
    if (error) throw error;
    var endVal = data.length;
    for (var i = 0; i < endVal; i++) {
        var priceFormatted = numeral(data[i].price).format("$000,000.00");
        var quantityFormatted = numeral(data[i].stock_quantity).format("0,000");
        var stockLowLevel = numeral(data[i].low_quantity_level).format("0,000");
        table.push([data[i].item_id, data[i].product_name, data[i].department_name, priceFormatted, quantityFormatted, stockLowLevel]);
    };
    console.log(table.toString());
    console.log("\n");
    start();
};


//function display products low on inventory
var dispLowStockLevels_start = function () {
    //no input, just blast out the files
    console.log("\nParts at low levels");
    sqlConnection.query("SELECT * FROM bamazon_db.products WHERE (stock_quantity<low_quantity_level)", function (error, data) {
        dispProducts_found(error, data);
    });
};


//products were found by the query
var dispLowStockLevels_found = function (error, data) {
    //first check if there was an error
    var table = new Table({
        head: ["Item", "Product name", "Department", "Price"],
        colWidths: [15, 42, 20, 15]
    });
    if (error) throw error;
    var endVal = data.length;
    for (var i = 0; i < endVal; i++) {
        var priceFormatted = numeral(data[i].price).format("$000,000.00");
        table.push([data[i].item_id, data[i].product_name, data[i].department_name, priceFormatted]);
    };
    console.log(table.toString());
    console.log("\n");
    start();
};


//searches for item_id in the db and return true
var validItemNum = function (_itemId) {
    sqlConnection.query("SELECT * FROM bamazon_db.products", function (error, data) {
        dispAllProducts_found(error, data);
    });

};


//function to return the quantity of an item
//will return quantity in stock
var quantityInStock = function (_itemId) {

};

//db_update ( item_id, new qty )
//takes in an item_id and then updates the qty

// function checkQty( item_id, qtyCheck )
//  check if there is enough qty to subtract
//  return true if so, false if not

//function fullFillOrder( item_id, qtyCheck )
// call checkQty
// 

//function buy
//  -- what ID
//  -- how many

var userSelectObj = {
    //global variable to hold what the user picked
    //allows all of the callbacks to reach these values
    item_id: "",
    product_name: "",
    department_name: "",
    price: 0.0,
    qty_in_stock: 0,
    qty_to_buy: 0,
    qty_after_buy: 0,
    order_total: 0
};


var dispError = function (msgStr) {
    console.log("");
    console.log("------ ERROR -----------------");
    console.log(msgStr);
    console.log("------------------------------");
    console.log("");
};


var dispOrder = function () {
    console.log("");
    console.log("--------- added to inventory -----------");
    console.log(userSelectObj.item_id + "  " + userSelectObj.product_name);
    console.log("Quantities:");
    console.log("before addition: " + numeral(userSelectObj.qty_in_stock).format("0,000") );
    console.log("quantity added : " + numeral(userSelectObj.qty_to_buy).format("0,000") );
    console.log("after addition : " + numeral(userSelectObj.qty_after_buy).format("0,000") );
    console.log("----------------------------------------");
    console.log("\n\n");
};


var storeDBtoObj = function (_data) {
    //store the data from the db to the global obj
    userSelectObj.product_name = _data[0].product_name;
    userSelectObj.department_name = _data[0].department_name;
    userSelectObj.qty_in_stock = _data[0].stock_quantity;
    userSelectObj.price = _data[0].price;
};


function managerMenu() {
    var pickedCmd = "";
    inquirer.prompt([
        {
            type: "list",
            message: "What command do you want ?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"],
            name: "cmdList",
            pageSize: 10
        }
    ]).then(function (answers) {
        //user picked a choice
        var pickedCmd = answers.cmdList.trim();
        switch (pickedCmd) {
            case "View Products for Sale":
                dispAllProducts_start();
                break;
            case "View Low Inventory":
                dispLowStockLevels_start();
                break;
            case "Add to Inventory":
                addInventory();
                break;
            case "Add New Product":
                break;
            case "Quit":
                return sqlConnection.end();
                break;
        };
        //evalCommand(cmdReadIn, cmdParam);
    });
};


function addInventory() {
    inquirer.prompt([
        {
            name: "item_to_increase",
            message: "Item to increase inventory on (quit to end): "
        }
    ]).then(function (answers) {
        //what the user picked  
        userSelectObj.item_id = answers.item_to_increase.trim().toUpperCase();
        if (userSelectObj.item_id === "QUIT") {
            return;
        };
        sqlConnection.query("SELECT * FROM bamazon_db.products WHERE ?",
            [{
                item_id: userSelectObj.item_id
            }],
            function (error, data) {
                //check if there were any hits
                if (data.length <= 0) {
                    dispError("no such item.  choose again");
                    return start();
                };
                //there was a find, check if there is enough qty
                storeDBtoObj(data);

                //now ask for the quantity
                inquirer.prompt([
                    {
                        name: "quantity",
                        message: "How much to add to inventory: "
                    }
                ]).then(function (answers) {
                    userSelectObj.qty_to_buy = parseInt(answers.quantity);

                    userSelectObj.qty_after_buy = userSelectObj.qty_in_stock + userSelectObj.qty_to_buy;
                    //so the quantity is correct update the database
                    sqlConnection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: userSelectObj.qty_after_buy
                            },
                            {
                                item_id: userSelectObj.item_id
                            }
                        ],
                        function (error) {
                            if (error) throw error;
                            dispOrder();
                            return start();
                        }
                    );

                }); // quantity input
            }); //part number input
    });
};



function userPrompt() {
    inquirer.prompt([
        {
            name: "item_to_buy",
            message: "Item to buy (quit to end): "
        }
    ]).then(function (answers) {
        //what the user picked  
        userSelectObj.item_id = answers.item_to_buy.trim().toUpperCase();
        if (userSelectObj.item_id === "QUIT") {
            sqlConnection.end();
            return;
        };
        sqlConnection.query("SELECT * FROM bamazon_db.products WHERE ?",
            [{
                item_id: userSelectObj.item_id
            }],
            function (error, data) {
                //check if there were any hits
                if (data.length <= 0) {
                    dispError("bad item.  choose again");
                    return start();
                };
                //there was a find, check if there is enough qty
                storeDBtoObj(data);

                //now ask for the quantity
                inquirer.prompt([
                    {
                        name: "quantity",
                        message: "How many to buy: "
                    }
                ]).then(function (answers) {
                    userSelectObj.qty_to_buy = parseInt(answers.quantity);

                    userSelectObj.qty_after_buy = userSelectObj.qty_in_stock - userSelectObj.qty_to_buy;
                    if (userSelectObj.qty_after_buy < 0) {
                        var msgStr = "Sorry, we are out of stock for your full order. \n";
                        msgStr += "You are ordering " + userSelectObj.qty_to_buy + " items of " + userSelectObj.product_name + "\n";
                        msgStr += "and we only have " + userSelectObj.qty_in_stock + ".";
                        dispError(msgStr);
                        return start();
                    } else {
                        //so the quantity is correct update the database
                        sqlConnection.query(
                            "UPDATE products SET ? WHERE ?",
                            [
                                {
                                    stock_quantity: userSelectObj.qty_after_buy
                                },
                                {
                                    item_id: userSelectObj.item_id
                                }
                            ],
                            function (error) {
                                if (error) throw error;
                                dispOrder();
                                return start();
                            }
                        );
                    };
                }); // quantity input
            }); //part number input
    });
};



function start() {
    //start of program
    managerMenu();

};

