
//Bamazon Manager file

//bamazonManager.js

var mySQL = require('mysql');
var inquirer = require("inquirer");
var Table = require('cli-table');
var numeral = require('numeral');
var moment = require('moment');



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


var dispInventoryAdd = function () {
    console.log("");
    console.log("--------- added to inventory -----------");
    console.log(userSelectObj.item_id + "  " + userSelectObj.product_name);
    console.log("Quantities:");
    console.log("before addition: " + numeral(userSelectObj.qty_in_stock).format("0,000"));
    console.log("quantity added : " + numeral(userSelectObj.qty_to_buy).format("0,000"));
    console.log("after addition : " + numeral(userSelectObj.qty_after_buy).format("0,000"));
    console.log("----------------------------------------");
    console.log("\n\n");
};


var dispInventoryAppend = function () {
    console.log("");
    console.log("--- new item appended to inventory------");
    console.log("Item ID           : " + userSelectObj.item_id  );
    console.log("Product name      : " + userSelectObj.product_name);
    console.log("Department        : " + userSelectObj.department_name);
    console.log("Quantity in stock : " + numeral(userSelectObj.qty_in_stock).format("0,000") );
    console.log("Low stock level   : " + numeral(userSelectObj.qty_low_level).format("0,000") );
    console.log("Price             : " + numeral(userSelectObj.price).format("$0,000.00") );
    console.log("----------------------------------------");
    console.log("\n\n");
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


var storeDBtoObj = function (_data) {
    //store the data from the db to the global obj
    userSelectObj.product_name = _data[0].product_name;
    userSelectObj.department_name = _data[0].department_name;
    userSelectObj.qty_in_stock = _data[0].stock_quantity;
    userSelectObj.price = _data[0].price;
    userSelectObj.product_sales = _data[0].product_sales;
    userSelectObj.qty_low_level = _data[0].low_quantity_level;
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
                newInventoryItem();
                break;
            case "Quit":
                return sqlConnection.end();
                break;
        };
    });
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
                    writeAuditRec("CHG QTY");
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
                            dispInventoryAdd();
                            return start();
                        }
                    );

                }); // quantity input
            }); //part number input
    });
};




function newInventoryItem() {
    inquirer.prompt([
        {
            name: "item_to_append",
            message: "Item ID of new item (quit to end): "
        }
    ]).then(function (answers) {
        //what the user picked  
        userSelectObj.item_id = answers.item_to_append.trim().toUpperCase();
        if (userSelectObj.item_id === "QUIT") {
            return start();
        };
        sqlConnection.query("SELECT * FROM bamazon_db.products WHERE ?",
            [{
                item_id: userSelectObj.item_id
            }],
            function (error, data) {
                //check if there were any hits
                //when adding a new item, it's bad if it exists already
                if (data.length > 0) {
                    dispError("item id already exisits. use Add to Inventory to change quantity");
                    return start();
                };
                //there was no find, so continue
                //now ask for the quantity
                inquirer.prompt([
                    {
                        name: "product",
                        message: "Product: "
                    },
                    {
                        name: "department",
                        message: "Department: "
                    },
                    {
                        name: "price",
                        message: "Price: "
                    },
                    {
                        name: "quantity",
                        message: "How much quantity to start with: "
                    },
                    {
                        name: "qty_low_level",
                        message: "Low stock level qty: "
                    }
                ]).then(function (answers) {
                    userSelectObj.product_name = answers.product;
                    userSelectObj.department_name = answers.department.toUpperCase();
                    userSelectObj.price = answers.price;
                    userSelectObj.qty_to_buy = parseInt(answers.quantity);
                    userSelectObj.qty_in_stock = parseInt(answers.quantity);
                    userSelectObj.qty_low_level = parseInt(answers.qty_low_level);
                    //so the quantity is correct update the database
                    writeAuditRec("ADD PROD" );
                    sqlConnection.query(
                        "INSERT INTO products SET ?",
                        {
                            item_id: userSelectObj.item_id,
                            product_name: userSelectObj.product_name,
                            department_name: userSelectObj.department_name,
                            price: userSelectObj.price,
                            stock_quantity: userSelectObj.qty_in_stock,
                            low_quantity_level: userSelectObj.qty_low_level
                        }
                        ,
                        function (error) {
                            if (error) throw error;
                            dispInventoryAppend();
                            return start();
                        }
                    );
                }); // quantity input
            }); //part number input
    });
};




function start() {
    //start of program
    managerMenu();

};

