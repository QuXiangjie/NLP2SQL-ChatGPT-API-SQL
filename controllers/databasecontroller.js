const sql = require('msnodesqlv8');
let connectionString = ''; // Declare the connectionString variable outside the function scope

exports.login = function (req, res) {
  var servername = req.body.servername;
  var database = req.body.database;
  var uid = req.body.uid;
  var pwd = req.body.pwd;

  // Construct the connection string
  connectionString = `server=${servername};Database=${database};Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0};Uid=${uid};Pwd=${pwd};`;
  const connectionStringtest = "server=DESKTOP-PB1U80G\\SQLEXPRESS;Database=OpenUniversity;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0};Uid=professor1;Pwd=professor1;";

  // Perform the database query to check the connection
  const query = 'select * from courses';

  sql.query(connectionString, query, (err, rows) => {
    if (err) {
      console.error(err);
      res.send('Unable to connect to the database');
    } else {
      // Database connection successful
      // Perform necessary actions (e.g., authentication, session management)
      // Redirect to the menu page
      res.redirect('/menu');

      //axios.get()   axios.post(,,)
    }
  });
};

// Export the connectionString variable
exports.getConnectionString = function () {
  return connectionString;
};

const SQLQuery = require('../models/SQLQuery'); // Import the SQLQuery model
const ExcelFile = require("../models/ExcelFile")

// Import Axios library
exports.executeQuery = function (req, res, excelId) {
  const sqlQuery = req.body.sqlQuery;

  const query = sqlQuery; // Set the SQL query to the received value

  sql.query(connectionString, query, (err, rows) => {
    if (err) {
      console.error(err);
      res.send('Unable to connect to the database');
    } else {
      console.log(rows);
      // Database connection successful
      // Perform necessary actions (e.g., authentication, session management)

      // Create a new instance of SQLQuery and save it
      const newSQLQuery = new SQLQuery({
        query: sqlQuery,
        rows: rows
      });

      newSQLQuery.save()
        .then(() => {
          // Fetch all queries
          SQLQuery.find({})
            .then((queries) => {
              // Fetch the Excel file
              ExcelFile.findOne({ _id: excelId })
                .then((excel) => {
                  if (!excel) {
                    return res.status(404).send('Excel file not found.');
                  }
                  // Render the details page with the current SQLQuery document, excelId, and queries
                  res.render('details', { id: excelId, queries: queries, excel: excel });
                })
                .catch((err) => {
                  console.error(err);
                  res.send('Error fetching Excel file');
                });
            })
            .catch((err) => {
              console.error(err);
              res.send('Error fetching queries');
            });
        })
        .catch((err) => {
          console.error(err);
          res.send('Error saving SQL query and rows');
        });
    }
  });
};





