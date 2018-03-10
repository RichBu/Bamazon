
SELECT  b.department_id as dept_id, a.item_id, a.product_name, a.department_name as dept, a.product_sales as sales, b.over_head_costs as overhead, a.product_sales - b.over_head_costs AS profits, SUM( a.product_sales - b.over_head_costs ) as totProfit FROM bamazon_db.products a  RIGHT JOIN bamazon_db.departments b ON a.department_name = b.department_name GROUP BY dept WITH ROLLUP



select * FROM (

) ORDER BY dept