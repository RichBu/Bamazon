# Bamazon
Amazon like NODE JS and mySQL application

by Rich Budek 03/08/2018

Project location for files:  [richbu.github.io](https://github.com/RichBu/Bamazon-NodeJS)

Description:
This is a Node.JS program that is the beginnings of a product tracking and purchasing software.
It is written in NODE.JS and is meant to run on a server. There are 3 modules:
Customer, Manager, and Supervisor. All the modules talk to a mySQL database and there can
be multiple users at the same time.

Each module would eventually be a separate login and html page with a different role for each.

CUSTOMER:
Type in: node bamazonCustomer.js to start the customer file.
![Customer main menu](/assets/images/screen_caps/Cust_01.png)

When the customer program starts up, all of the products that can be purchased are displayed.
The user is then prompted to type in the item_id or part number of what he/she wants to
purchase.  If there is not sufficient quantity to complete the order, the user is not allowed
to purchase anything and the process aborts after informing the user.

If there is sufficient stock, then a shipping ticket is printed telling the user the item id, the
product name and quantity shipped. This quantity is automatically subtracted from stock.
![Order has been shipped](/assets/images/screen_caps/Cust_Ship_01.png)


MANAGER:
To start the manager module, type in:  node bamazonManager.js.  This module has a menu, and
this is what it looks like:
![Manager main menu](/assets/images/screen_caps/Manag_Menu.png)

Picking the inventory option will list all of the products in stock and the quantities:
![Manager inventory](/assets/images/screen_caps/Manag_Inven_01.png)

As the screen printout shows, for each item there is also a low level or minimum quantity
that should be kept on hand.  This allows setting a different reorder level for each item.
A different report lists all of the items that currently are low in stock and that should be
ordered.
![Low level ordering](/assets/images/screen_caps/Manag_LowInven_01.png)


SUPERVISOR:
To start the supervisor manager module, type in:  node bamazonSupervisor.js  This module
prints out the financials for the company.

![Supervisor main menu](/assets/images/screen_caps/Supv_Main_01.png)

Printing the profitibility report shows how much profit the business has generated.
![Customer main menu](/assets/images/screen_caps/Supv_Profits.png)

To find out which products are selling and to cross check the profitabiity report, the
user can select the sales report.  Here every product along with it's cummaltive sales
are printed and the user can see total dollars in sales.
![Customer main menu](/assets/images/screen_caps/Supv_Sales.png)


Demonstration Videos

Customer module:
[![Bamazon Customer](https://img.youtube.com/vi/PGltPMZavqU/0.jpg)](https://www.youtube.com/watch?v=PGltPMZavqU)

Manager module:
[![Bamazon Manager](https://img.youtube.com/vi/jRyFefHEFbc/0.jpg)](https://www.youtube.com/watch?v=jRyFefHEFbc)

Supervisor module:
[![Supervisor Manager](https://img.youtube.com/vi/VIH1bufJwqg/0.jpg)](https://www.youtube.com/watch?v=VIH1bufJwqg)


Technolgies used:
1. Node.JS
2. Javascript for program functions
3. Inquirer for menus
4. mySQL for the database
5. Numeral for number formatting
6. CLI-Table for displaying the table of data

Internal design:
All of the modules write to a SQL database located on the network, most likely on the same
computer.  Two tables are in the database, one with the products and the other for the
departments.  For every items, it's item_id, description, sell price as well as total sales
are stored.  Additionally, the stock quantity and the re-order quantities are tracked.

The department table stores the department ID and department name.

All data reading and writing is done thru queries so multi-users can access the reading or
writing.

To do:
1. Better UI
2. Customer module to have a menu.
3. Interface to an HTML page using handlebars ??


