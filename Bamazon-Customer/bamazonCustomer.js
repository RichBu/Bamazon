

//bamazonCustomer.js  customer files for the Bamazon application

var mySQL = require('mysql');
var inquirer = require("inquirer");
var Table = require('cli-table');


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
    console.log("start the query");
    sqlConnection.query("SELECT * FROM bamazon_db.products", function (error, data) {
        dispAllProducts_found(error, data);
    });
    console.log("after query");
};


//products were found by the query
var dispAllProducts_found = function (error, data) {
    //first check if there was an error
    console.log("query done, in the found routine");
    var table = new Table({
        head: ["Item", "Product name", "Department", "Price", "Qty in Stock"],
        colWidths: [10, 40, 20, 10, 10]
    });
    if (error) throw error;
    var endVal = data.length;
    for (var i = 0; i < endVal; i++) {
        table.push( [ data[i].item_id, data[i].product_name, data[i].department_name, data[i].price, data[i].stock_quantity ] );
    };
    console.log( table.toString() );
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


function start() {
    //start of program
    dispAllProducts_start();
};
