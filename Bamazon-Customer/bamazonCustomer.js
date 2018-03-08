

//bamazonCustomer.js  customer files for the Bamazon application

var mySQL = require('mysql');
var inquirer = require("inquirer");
var Table = require('cli-table');
var numeral = require('numeral');

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
    sqlConnection.query("SELECT * FROM bamazon_db.products", function (error, data) {
        dispAllProducts_found(error, data);
    });
};


//products were found by the query
var dispAllProducts_found = function (error, data) {
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
    userPrompt();
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
    console.log("---------your order -----------");
    console.log(userSelectObj.item_id + "  " + userSelectObj.product_name );
    var priceFormatted = numeral(userSelectObj.price).format("$000,000.00");
    userSelectObj.order_total = userSelectObj.price * userSelectObj.qty_to_buy;
    var totalFormatted = numeral( userSelectObj.order_total ).format("$0000,000.00");
    console.log("unit price = " + priceFormatted + " x " + userSelectObj.qty_to_buy + " units = " + totalFormatted + " total" );
    console.log("------------------------------");
    console.log("\nIs shipping. thank-you\n\n");
};


var storeDBtoObj = function (_data) {
    //store the data from the db to the global obj
    userSelectObj.product_name = _data[0].product_name;
    userSelectObj.department_name = _data[0].department_name;
    userSelectObj.qty_in_stock = _data[0].stock_quantity;
    userSelectObj.price = _data[0].price;
};


function userPrompt() {
    inquirer.prompt([
        {
            name: "item_to_buy",
            message: "Item to buy (quit to end): "
        }, {
            name: "quantity",
            message: "How many to buy: "
        }
    ]).then(function (answers) {
        //what the user picked  
console.log("user selected");        
        userSelectObj.item_id = answers.item_to_buy.trim().toUpperCase();
        userSelectObj.qty_to_buy = parseInt(answers.quantity);
        if (userSelectObj.item_id === "QUIT") {
            sqlConnection.end();
            return;
        };
console.log("searching");
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
                userSelectObj.qty_after_buy = userSelectObj.qty_in_stock - userSelectObj.qty_to_buy;
console.log(userSelectObj);                
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
            });
    });
};



function start() {
    //start of program
    dispAllProducts_start();

};

