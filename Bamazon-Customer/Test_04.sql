
SELECT  dept_id, dept, sales, overhead, sales-overhead AS profits,  SUM( sales - overhead ) as totProfit  FROM ( SELECT  bamazon_db.departments.department_id as dept_id,  bamazon_db.departments.department_name as dept,  bamazon_db.products.product_sales as sales, bamazon_db.departments.over_head_costs as overhead  FROM bamazon_db.products RIGHT JOIN bamazon_db.departments  ON bamazon_db.products.department_name = bamazon_db.departments.department_name ORDER BY dept  ) AS qTable GROUP BY dept_id


