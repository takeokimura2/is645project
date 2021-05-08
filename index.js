// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));

// Setup EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Application folders
app.use(express.static("public"));

// Start listener
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

// Setup routes
app.get("/", (req, res) => {
  //res.send("Root resource - Up and running!")
  res.render("index");
});

app.get("/customers", async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();

  //Create an empty customer object (To populate form with values)
  const cust = {
    cusid: "",
    cusfname: "",
    cuslname: "",
    cusstate: "",
    cussalesytd: "",
    cussalesprev: "",
  };

  res.render("customers", {
    type: "get",
    totRecs: totRecs.totRecords,
    cust: cust,
  });
});

app.post("/customers", async (req, res) => {
  // Omitted validation check
  //  Can get this from the page rather than using another DB call.
  //  Add it as a hidden form value.
  const totRecs = await dblib.getTotalRecords();

  console.log("Post Serach, req.body is: ", req.body)

  dblib.findCustomers(req.body)
    .then(result => {
      console.log("result from findCustomers is:", result);
      res.render("customers", {
        type: "post",
        totRecs: totRecs.totRecords,
        result: result,
        cust: req.body
      })
    })
    .catch(err => {
      res.render("customers", {
        type: "post",
        totRecs: totRecs.totRecords,
        result: `Unexpected Error: ${err.message}`,
        cust: req.body
      });
    });
});

// GET /edit/
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);

  dblib.editCustomers(id)
    .then(result => {
      console.log("result from editCustomers is:", result.cust);
      res.render("edit", {
        type: "get",
        cust: result.cust,
      })
    })
    .catch(err => {
      res.render("edit", {
        type: "get",
        result: `Unexpected Error: ${err.message}`,
        cust: req.body
      });
    });
});

// POST /edit/5
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;

  //converting the year to date sales from string to number
  ytdsales = req.body.cussalesytd;
  numberYtdSales = Number(ytdsales.replace(/[^0-9\.-]+/g, ""))
  console.log(numberYtdSales);

  //converting the previous year sales from string to number

  prevsales = req.body.cussalesprev;
  numberPrevSales = Number(prevsales.replace(/[^0-9\.-]+/g, ""))
  console.log(numberPrevSales);

  const customer = [req.body.cusfname, req.body.cuslname, req.body.cusstate, numberYtdSales, numberPrevSales, id];

  dblib.updateCustomers(customer)
    .then(result => {
      res.render("edit", {
        type: "post",
        msg: "success",
        cust: result,
      })
        .catch(err => {
          res.render("edit", {
            type: "post",
            msg: `Error: ${err.message}`,
          })
        })
    })
});

// GET /delete/
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);

  dblib.editCustomers(id)
    .then(result => {
      console.log("result from editCustomers is:", result.cust);
      res.render("delete", {
        type: "get",
        cust: result.cust,
      })
    })
    .catch(err => {
      res.render("delete", {
        type: "get",
        result: `Unexpected Error: ${err.message}`,
        cust: req.body
      });
    });
});

// POST /delete/
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;


  dblib.deleteCustomers(id)
    .then(result => {
      res.render("delete", {
        type: "post",
        msg: "success",
        cust: result,
      })
        .catch(err => {
          res.render("delete", {
            type: "post",
            msg: `Error: ${err.message}`,
          })
        })
    })
});

// GET /create
app.get("/create", (req, res) => {

  //Create an empty customer object (To populate form with values)
  const customer = {
    cusid: "",
    cusfname: "",
    cuslname: "",
    cusstate: "",
    cussalesytd: "",
    cussalesprev: "",
  };
  res.render("create", { cust: customer });
});

// POST /create
app.post("/create", (req, res) => {

  dblib.addCustomers(req.body);

});
