// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

//function to get the total records of customers in the database
const getTotalRecords = () => {
  sql = "SELECT COUNT(*) FROM customer";
  return pool.query(sql)
    .then(result => {
      return {
        msg: "success",
        totRecords: result.rows[0].count
      }
    })
    .catch(err => {
      return {
        msg: `Error: ${err.message}`
      }
    });
};

//function to find customers based on the user input
const findCustomers = (customer) => {
  // Will build query based on data provided from the form
  //  Use parameters to avoid sql injection

  // Declare variables
  var i = 1;
  params = [];
  sql = "SELECT * FROM customer WHERE true";

  // Check data provided and build query as necessary
  if (customer.cusid !== "") {
    params.push(parseInt(customer.cusid));
    sql += ` AND cusid = $${i}`;
    i++;
  };
  if (customer.cusfname !== "") {
    params.push(`${customer.cusfname}%`);
    sql += ` AND UPPER(cusfname) LIKE UPPER($${i})`;
    i++;
  };
  if (customer.cuslname !== "") {
    params.push(`${customer.cuslname}%`);
    sql += ` AND UPPER(cuslname) LIKE UPPER($${i})`;
    i++;
  };
  if (customer.cusstate !== "") {
    params.push(`${customer.cusstate}%`);
    sql += ` AND UPPER(cusstate) LIKE UPPER($${i})`;
    i++;
  };
  if (customer.cussalesytd !== "") {
    params.push(parseFloat(customer.cussalesytd));
    sql += ` AND cussalesytd >= $${i}`;
    i++;
  };
  if (customer.cussalesprev !== "") {
    params.push(parseFloat(customer.cussalesprev));
    sql += ` AND cussalesprev >= $${i}`;
    i++;
  };

  sql += ` ORDER BY cusid`;
  // for debugging
  console.log("sql: " + sql);
  console.log("params: " + params);

  return pool.query(sql, params)
    .then(result => {
      return {
        trans: "success",
        result: result.rows
      }
    })
    .catch(err => {
      return {
        trans: "Error",
        result: `Error: ${err.message}`
      }
    });
};

const editCustomers = (id) => {
  const sql = `SELECT * FROM CUSTOMER WHERE cusid = ${id}`;

  console.log(sql);

  return pool.query(sql)
    .then(result => {

      console.log(result.rows[0]);
      return {
        msg: "Success",
        cust: result.rows[0]
      }
    })
    .catch(err => {
      return {
        msg: `Error: ${err.message}`
      }
    })
}

const updateCustomers = (customer) => {

  const sql = `UPDATE CUSTOMER SET cusfname = '${customer[0]}', cuslname = '${customer[1]}', cusstate = '${customer[2]}', cussalesytd = '${customer[3]}', cussalesprev = '${customer[4]}' WHERE (cusid = ${customer[5]})`;
  console.log(sql);

  return pool.query(sql)
    .then(result => {
      console.log(result);
      return {
        msg: "Success",
        result: result.rows[0]
      }
    })
    .catch(err => {
      console.log(err);

      return {

        msg: `Error: ${err.message}`
      }
    })
}

const deleteCustomers = (customerID) => {
  const sql = `DELETE FROM CUSTOMER WHERE cusid = ${customerID}`;
  console.log(sql);

  return pool.query(sql)
    .then(result => {
      console.log(result);
      return {
        msg: "Success",
        result: result.rows[0]
      }
    })
    .catch(err => {
      console.log(err);

      return {

        msg: `Error: ${err.message}`
      }
    })

}


const addCustomers = (customer) => {

  // Declare variables
  var i = 1;
  params = [];
  sql = "INSERT INTO CUSTOMER (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev) VALUES ($1, $2, $3, $4, $5, $6)";

  // Check data provided and build query as necessary
  if (customer.cusid !== "") {
    params.push(parseInt(customer.cusid));
    i++;
  };
  if (customer.cusfname !== "") {
    params.push(`${customer.cusfname}%`);
    i++;
  };
  if (customer.cuslname !== "") {
    params.push(`${customer.cuslname}%`);
    i++;
  };
  if (customer.cusstate !== "") {
    params.push(`${customer.cusstate}%`);
    i++;
  };
  if (customer.cussalesytd !== "") {
    params.push(parseFloat(customer.cussalesytd));
    i++;
  };
  if (customer.cussalesprev !== "") {
    params.push(parseFloat(customer.cussalesprev));
    i++;
  };

  console.log(customer);
  console.log(params);
  console.log(customer.cusid);

}

module.exports.getTotalRecords = getTotalRecords;
module.exports.findCustomers = findCustomers;
module.exports.editCustomers = editCustomers;
module.exports.updateCustomers = updateCustomers;
module.exports.deleteCustomers = deleteCustomers;
module.exports.addCustomers = addCustomers;