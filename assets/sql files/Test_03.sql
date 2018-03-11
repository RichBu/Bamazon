SELECT  b.department_id as dept_id, b.department_name as dept, a.product_sales as sales, b.over_head_costs as overhead, a.product_sales - b.over_head_costs AS profits, SUM( a.product_sales - b.over_head_costs ) as totProfit FROM bamazon_db.products a  RIGHT JOIN bamazon_db.departments b ON a.department_name = b.department_name GROUP BY dept_id


SELECT  dept_id, dep, sales, overhead, sales-costs AS profits,  SUM( sales - overhead ) as totProfit  FROM ( SELECT  bamazon_db.departments.department_id as dept_id,  bamazon_db.departments.department_name as dept,  bamazon_db.products.product_sales as sales, bamazon_db.departments.over_head_costs as overhead  FROM bamazon_db.products RIGHT JOIN bamazon_db.departments  ON bamazon_db.products.department_name = bamazon_db.departments.department_name ORDER BY dept  )

 bamazon_db.products a  RIGHT JOIN bamazon_db.departments b ON a.department_name = b.department_name 
 
 GROUP BY dept_id
