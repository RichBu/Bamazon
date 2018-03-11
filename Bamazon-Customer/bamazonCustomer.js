

//bamazonCustomer.js  customer files for the Bamazon application

var mySQL = require('mysql');
var inquirer = require("inquirer");
var Table = require('cli-table');
var numeral = require('numeral');
var moment = require('moment');

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
    start_firstTime();
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
    customerMenu();
};


var userSelectObj = {
    //global variable to hold what the user picked
    //allows all of the callbacks to reach these values
    item_id: "",
    product_name: "",
    department_name: "",
    price: 0.0,
    qty_in_stock: 0,
    qty_low_level: 0,
    qty_to_buy: 0,
    qty_after_buy: 0,
    order_total: 0,
    product_sales: 0
};


var auditRecObj = {
    //global record for the audit file
    //put all items in here before writing.
    //makes it easier to debug
    audit_date: 0,
    audit_type: "",
    item_id: "",
    product_name: "",
    department_name: "",
    price: 0.0,
    qty_to_buy: 0,
    stock_quantity: 0,
    low_quantity_level: 0,
    product_sales: 0.00,
    over_head_costs: 0.00
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
    console.log(userSelectObj.item_id + "  " + userSelectObj.product_name);
    var priceFormatted = numeral(userSelectObj.price).format("$000,000.00");
    var totalFormatted = numeral(userSelectObj.order_total).format("$0000,000.00");
    console.log("unit price = " + priceFormatted + " x " + userSelectObj.qty_to_buy + " units = " + totalFormatted + " total");
    console.log("------------------------------");
    console.log("\nIs shipping. thank-you\n\n");
};


var storeDBtoObj = function (_data) {
    //store the data from the db to the global obj
    userSelectObj.product_name = _data[0].product_name;
    userSelectObj.department_name = _data[0].department_name;
    userSelectObj.qty_in_stock = _data[0].stock_quantity;
    userSelectObj.price = _data[0].price;
    userSelectObj.product_sales = _data[0].product_sales;
    userSelectObj.qty_low_level = _data[0].low_quantity_level;
};


//function display products low on inventory
var dispOrders_start = function () {
    //no input, just blast out the files
    console.log("\nList previous orders");
    sqlConnection.query("SELECT * FROM bamazon_db.orders", function (error, data) {
        dispOrders_found(error, data);
    });
};


//products were found by the query
var dispOrders_found = function (error, data) {
    //first check if there was an error
    var table = new Table({
        head: ["Order", "Ord Date", "Item", "Product name", "Department", "Price", "Qty"],
        colWidths: [8, 19, 15, 42, 20, 15, 8]
    });
    if (error) throw error;
    var endVal = data.length;
    for (var i = 0; i < endVal; i++) {
        var ordDate = moment.unix(data[i].order_date).format("MM-DD-YYYY HH:mm");
console.log(ordDate);
        var priceFormatted = numeral(data[i].price).format("$000,000.00");
        table.push([data[i].order_id, ordDate, data[i].item_id, data[i].product_name, data[i].department_name, priceFormatted, data[i].qty_to_buy]);
    };
    console.log(table.toString());
    console.log("\n");
    customerMenu();
};



var writeAuditRec = function (auditType) {
    //writes the audit record
    //it is async so other writes and updates could be
    //happening.  maybe have interlock ??
    var currDate = moment().unix();
    auditRecObj.audit_date = currDate;
    auditRecObj.audit_type = auditType; //incoming
    auditRecObj.item_id = userSelectObj.item_id;
    auditRecObj.product_name = userSelectObj.product_name;
    auditRecObj.department_name = userSelectObj.department_name;
    auditRecObj.price = userSelectObj.price;
    auditRecObj.qty_to_buy = userSelectObj.qty_to_buy;
    auditRecObj.stock_quantity = userSelectObj.qty_in_stock;
    auditRecObj.low_quantity_level = userSelectObj.qty_low_level;
    auditRecObj.product_sales = userSelectObj.product_sales + userSelectObj.order_total;
    auditRecObj.over_head_costs = 0.00;

    sqlConnection.query(
        "INSERT INTO audits SET ?",
        {
            audit_date: auditRecObj.audit_date,
            audit_type: auditRecObj.audit_type,
            item_id: auditRecObj.item_id,
            product_name: auditRecObj.product_name,
            department_name: auditRecObj.department_name,
            price: auditRecObj.price,
            qty_to_buy: auditRecObj.qty_to_buy,
            stock_quantity: auditRecObj.stock_quantity,
            low_quantity_level: auditRecObj.low_quantity_level,
            product_sales: auditRecObj.product_sales,
            over_head_costs: auditRecObj.over_head_costs
        }
        ,
        function (error) {
            if (error) throw error;
            //wrote the audit record should it interlock ?
            //should really
        });
};



var writeOrderRec = function () {
    //writes the order record
    //it is async so other writes and updates could be
    //happening.  maybe have interlock ??
    var currDate = moment().unix();
    sqlConnection.query(
        "INSERT INTO orders SET ?",
        {
            order_date: currDate,
            item_id: userSelectObj.item_id,
            product_name: userSelectObj.product_name,
            department_name: userSelectObj.department_name,
            price: userSelectObj.price,
            qty_to_buy: userSelectObj.qty_to_buy
        }
        ,
        function (error) {
            if (error) throw error;
            //wrote the order record should it interlock ?
        });
};



var writeAllRecsTo_db = function (auditType) {
    //write to the orders table and to the audit rec

    //write the audit record first, then write the order record
    writeAuditRec(auditType);
    writeOrderRec();
};



function userPrompt() {
    inquirer.prompt([
        {
            name: "item_to_buy",
            message: "Item to buy ('quit' to end or 'list' to view products): "
        }
    ]).then(function (answers) {
        //what the user picked  
        userSelectObj.item_id = answers.item_to_buy.trim().toUpperCase();
        if (userSelectObj.item_id === "QUIT" || userSelectObj.item_id === "LIST") {
            //do it in two stages, so first if statement is quick
            if (userSelectObj.item_id === "QUIT") {
                return customerMenu();
            } else if (userSelectObj.item_id === "LIST") {
                //it was checked twice !!! just for readability have it here
                return dispAllProducts_start();
            };
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
                    userSelectObj.order_total = userSelectObj.price * userSelectObj.qty_to_buy;

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
                                    stock_quantity: userSelectObj.qty_after_buy,
                                    product_sales: userSelectObj.product_sales + userSelectObj.order_total
                                },
                                {
                                    item_id: userSelectObj.item_id
                                }
                            ],
                            function (error) {
                                if (error) throw error;
                                writeAuditRec("SALE");
                                writeOrderRec();
                                dispOrder();
                                return start();
                            }
                        );
                    };
                }); // quantity input
            }); //part number input
    });
};


function customerMenu() {
    var pickedCmd = "";
    console.log("\n\nCustomer Menu - Bamazon by Rich Budek\n");
    inquirer.prompt([
        {
            type: "list",
            message: "What command do you want ?",
            choices: ["List products for sale", "Buy Products", "Previous Orders", "Quit"],
            name: "cmdList",
            pageSize: 10
        }
    ]).then(function (answers) {
        //user picked a choice
        var pickedCmd = answers.cmdList.trim();
        switch (pickedCmd) {
            case "List products for sale":
                dispAllProducts_start();
                break;
            case "Buy Products":
                userPrompt();
                break;
            case "Previous Orders":
                dispOrders_start();
                break;
            case "Quit":
                return sqlConnection.end();
                break;
        };
    });
};


function start_firstTime() {
    dispAllProducts_start();
};


function start() {
    //start of program
    customerMenu();
};

