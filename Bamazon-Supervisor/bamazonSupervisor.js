
//bamazonSupervisor.js  

//bamazon supervisor program



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
    // run the start function after the connection is made to prompt the user
    start();
});


//function displays profits by Dept low on inventory
var dispProfitsByDeptSummary_start = function () {
    //display the profits by department, just the summary
    console.log("\nProfits by department");
    //for this query to work, need to set defaul in myQiuery
    //SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
    sqlConnection.query("SELECT  qTable.dept_id, qTable.dept, SUM(qTable.sales) as totSales, qTable.overhead, qTable.profits as totProfits  FROM ( SELECT bamazon_db.departments.department_id as dept_id, bamazon_db.departments.department_name as dept,  bamazon_db.products.product_sales as sales, bamazon_db.departments.over_head_costs as overhead,  bamazon_db.products.product_sales - bamazon_db.departments.over_head_costs AS profits FROM bamazon_db.products RIGHT JOIN bamazon_db.departments  ON bamazon_db.products.department_name = bamazon_db.departments.department_name ORDER BY  bamazon_db.departments.department_name ) qTable GROUP BY dept", function (error, data) {
        dispProfitsSummary_found(error, data);
    });
};


var dispProfitsSummary_found = function (error, data) {
    //first check if there was an error
    var table = new Table({
        head: ["Dept ID", "Department Name", "Total Sales", "Overhead", "Total Profit"],
        colWidths: [10, 20, 15, 15, 15]
    });
    if (error) throw error;
    var endVal = data.length;  //last record is the total sum of all profits
    for (var i = 0; i < endVal; i++) {
        var salesFormatted = numeral(data[i].totSales).format("$0,000.00");
        var overheadFormatted = numeral(data[i].overhead).format("$0,000.00");
        var profitsFormatted = numeral(data[i].totSales - data[i].overhead).format("$0,000.00");
        table.push([data[i].dept_id, data[i].dept, salesFormatted, overheadFormatted, profitsFormatted]);
    };
    console.log(table.toString());
    console.log("\n");
    start();
};


//function displays profits by Dept low on inventory
var dispSales_start = function () {
    //display the profits by department, just the summary
    console.log("\nSales report - products sorted by department");
    //for this query to work, need to set defaul in myQiuery
    //SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
    sqlConnection.query("SELECT  qTable.dept_id, qTable.dept, qTable.prodName, qTable.sales, qTable.overhead, qTable.profits as totProfits  FROM ( SELECT bamazon_db.departments.department_id as dept_id, bamazon_db.departments.department_name as dept, bamazon_db.products.product_name as prodName,  bamazon_db.products.product_sales as sales, bamazon_db.departments.over_head_costs as overhead,  bamazon_db.products.product_sales - bamazon_db.departments.over_head_costs AS profits FROM bamazon_db.products RIGHT JOIN bamazon_db.departments  ON bamazon_db.products.department_name = bamazon_db.departments.department_name ORDER BY  bamazon_db.departments.department_name ) qTable", function (error, data) {
        dispSales_found(error, data);
    });
};


//products were found by the query
var dispSales_found = function (error, data) {
    //first check if there was an error
    var table = new Table({
        head: ["Dept ID", "Department Name", "Product Name", "Product Sales"],
        colWidths: [10, 20, 40, 15]
    });
    if (error) throw error;
    var endVal = data.length;  //last record is the total sum of all profits
    for (var i = 0; i < endVal; i++) {
        if( data[i].sales == null) { data[i].sales = 0; }
        if( data[i].prodName == null) { data[i].prodName = "";  }
        var salesFormatted = numeral(data[i].sales).format("$0,000.00");
        table.push([data[i].dept_id, data[i].dept, data[i].prodName, salesFormatted]);
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
    over_head_costs: 0.0,
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


var storeDBtoObj = function (_data) {
    //store the data from the db to the global obj
    userSelectObj.product_name = _data[0].product_name;
    userSelectObj.department_name = _data[0].department_name;
    userSelectObj.qty_in_stock = _data[0].stock_quantity;
    userSelectObj.price = _data[0].price;
    userSelectObj.product_sales = _data[0].product_sales,
    userSelectObj.qty_low_level = _data[0].low_quantity_level
};




//function display products low on inventory
var dispAudits_start = function () {
    //no input, just blast out the files
    console.log("\nListing of Audit File");
    sqlConnection.query("SELECT * FROM bamazon_db.audits", function (error, data) {
        dispAudits_found(error, data);
    });
};


//products were found by the query
var dispAudits_found = function (error, data) {
    //first check if there was an error
    var table = new Table({
        head: ["Audit Date", "Audit Type", "Item", "Product name", "Department", "Price", "Qty Ord", "Stk Qty", "Low Lvl", "Prod Sales", "Overhead" ],
        colWidths: [19, 12, 15, 42, 20, 15, 10, 10, 10, 12, 12]
    });
    if (error) throw error;
    var endVal = data.length;
    for (var i = 0; i < endVal; i++) {
        var auditDate = moment.unix(data[i].audit_date).format("MM-DD-YYYY HH:mm");
        var priceFormatted = numeral(data[i].price).format("$000,000.00");
        if ( data[i].stock_quantity == null) {data[i].stock_quantity=0; }
        table.push([auditDate, data[i].audit_type, data[i].item_id, data[i].product_name, data[i].department_name, priceFormatted, data[i].qty_to_buy, data[i].stock_quantity, data[i].low_quantity_level, data[i].product_sales, data[i].over_head_costs ]);
    };
    console.log(table.toString());
    console.log("\n");
    supervisorMenu();
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
    auditRecObj.over_head_costs = userSelectObj.over_head_costs;

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


function newDepartment() {
    inquirer.prompt([
        {
            name: "dept_to_append",
            message: "Department to add (quit to end): "
        }
    ]).then(function (answers) {
        //what the user picked  
        userSelectObj.department_name = answers.dept_to_append.trim().toUpperCase();  //store to global object
        if (userSelectObj.department_name === "QUIT") {
            return start();
        };
        sqlConnection.query("SELECT * FROM bamazon_db.departments WHERE ?",
            [{
                department_name: userSelectObj.department_name
            }],
            function (error, data) {
                //check if there were any hits
                //when adding a new department, it's bad if it exists already
                if (data.length > 0) {
                    dispError("department already exisits.");
                    return start();
                };

                inquirer.prompt([
                    {
                        name: "overhead",
                        message: "Overhead Costs : "
                    }
                ]).then(function (answers) {
                    userSelectObj.over_head_costs = answers.overhead;
                    writeAuditRec("NEW DEPT");
                    //add a new department
                    sqlConnection.query(
                        "INSERT INTO departments SET ?",
                        {
                            department_name: userSelectObj.department_name,
                            over_head_costs: userSelectObj.over_head_costs
                        }
                        ,
                        function (error) {
                            if (error) throw error;
                            console.log('Department ' + userSelectObj.department_name  );
                            console.log('successfully added.\n');
                            return start();
                        }
                    )
                }); //overhead costs
            });
    }); //department input
};



function supervisorMenu() {
    var pickedCmd = "";
    console.log("");
    inquirer.prompt([
        {
            type: "list",
            message: "What command do you want ?",
            choices: ["View Profits by Dept", "View Product Sales", "Create New Department", "List Audit File","Quit"],
            name: "cmdList",
            pageSize: 10
        }
    ]).then(function (answers) {
        //user picked a choice
        var pickedCmd = answers.cmdList.trim();
        switch (pickedCmd) {
            case "View Profits by Dept":
                dispProfitsByDeptSummary_start()
                break;
            case "View Product Sales":
                dispSales_start()
                break;
            case "Create New Department":
                newDepartment();
                break;
            case "List Audit File":
                dispAudits_start();
                break;
            case "Quit":
                return sqlConnection.end();
                break;
        };
    });
};


function start() {
    //start of program
    supervisorMenu();

};



