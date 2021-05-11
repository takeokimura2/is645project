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
  value = "";
  columns = "";


  // Check data provided and build query as necessary
  if (customer.cusid !== "") {
    params.push(parseInt(customer.cusid));
    columns += "cusid";
    value += `$${i}`
    i++;
  };
  if (customer.cusfname !== "") {
    params.push(`${customer.cusfname}`);
    columns += ", cusfname";
    value += `, $${i}`
    i++;
  };
  if (customer.cuslname !== "") {
    params.push(`${customer.cuslname}`);
    columns += ", cuslname";
    value += `, $${i}`
    i++;
  };
  if (customer.cusstate !== "") {
    params.push(`${customer.cusstate.toUpperCase()}`);
    columns += ", cusstate";
    value += `, $${i}`
    i++;
  }
  if (customer.cussalesytd !== "") {
    params.push(parseFloat(customer.cussalesytd));
    columns += ", cussalesytd";
    value += `, $${i}`
    i++;
  }
  if (customer.cussalesprev !== "") {
    params.push(parseFloat(customer.cussalesprev));
    columns += ", cussalesprev";
    value += `, $${i}`
    i++;
  }

  sql = `INSERT INTO CUSTOMER (${columns}) VALUES (${value})`;

  //for debugging purpose
  console.log(columns);
  console.log(params);
  console.log(value);
  console.log(sql);

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

}

const importCustomers = async (lines) => {

  const sql = "INSERT INTO CUSTOMER (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev) VALUES ($1, $2, $3, $4, $5, $6)";

  let totalCount = 0;
  let successCount = 0;
  let errorCount = 0;
  let errorList = [];

  for (line of lines) {
    //console.log(line);
    customer = line.split(",");
    //console.log(customer);

    await pool.query(sql, customer)
      .then(result => {

        totalCount += 1;
        successCount += 1;

      })
      .catch(err => {

        totalCount += 1;
        errorCount += 1;
        message = `Customer ID: ${customer[0]} - ` + err;
        //console.log(message);
        errorList.push(message)
      });
  };

  return {
    totalCount: totalCount,
    successCount: successCount,
    errorCount: errorCount,
    errorList: errorList
  }
}


const exportCustomers = () => {

  const sql = "SELECT * FROM CUSTOMER ORDER BY cusid";

  pool.query(sql, [])
    .then(result => {
      var output = "";
      result.rows.forEach(customer => {
        output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},${customer.cussalesytd},${customer.cussalesprev}\r\n`;
      })

      console.log(output);

      return output;
    })
    .catch(err => {
      console.log(err.message)
    })
}

module.exports.getTotalRecords = getTotalRecords;
module.exports.findCustomers = findCustomers;
module.exports.editCustomers = editCustomers;
module.exports.updateCustomers = updateCustomers;
module.exports.deleteCustomers = deleteCustomers;
module.exports.addCustomers = addCustomers;
module.exports.importCustomers = importCustomers;
module.exports.exportCustomers = exportCustomers;