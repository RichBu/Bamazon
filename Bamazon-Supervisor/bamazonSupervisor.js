
//bamazonSupervisor.js  

//bamazon supervisor program



var mySQL = require('mysql');
var inquirer = require("inquirer");
var Table = require('cli-table');
var numeral = require('numeral');



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
            choices: ["View Profits by Dept", "View Product Sales", "Create New Department", "Quit"],
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



