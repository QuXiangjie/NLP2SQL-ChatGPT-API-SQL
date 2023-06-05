var express = require('express');
var router = express.Router();
var nlp2sqlcontroller = require("../controllers/nlp2sqlcontrollers")

const DatabaseController = require('../controllers/databasecontroller');
const excel2sqlcontroller = require('../controllers/excel2sqlcontrollers');
const SQLQuery=require('../models/SQLQuery')
//for excel
const upload = require('multer')();
//for excel
const util = require('util');

/* GET users listing. */

const ExcelFile = require("../models/ExcelFile")

router.post('/executeQuery', (req, res) => {
  const excelId = req.query.id; // Extract the excelId from the query parameters
  console.log("this is exceID+",excelId)
  DatabaseController.executeQuery(req, res, excelId);
});


//get the one excel page
router.post('/excel_submit', upload.single('excel_file'), excel2sqlcontroller.getExcelHeader);


//get all

router.get("/", (req, res) => {
  res.render("login");
});

router.post('/login?', (req, res) => {
  console.log("1");
  DatabaseController.login(req, res);

});

router.get('/menu', async (req, res) => {
  const excelFiles = await ExcelFile.find({}, 'fileName');
  // render the file submited
  res.render('sample', { excelFiles });
});

//details of excel file
router.get('/details', (req, res) => {
  const id = req.query.id;

  excel2sqlcontroller.getExcelpage_get(req, res, id);
});
router.post('/details', function (req, res) {
  excel2sqlcontroller.getExcelpage_post(req, res)
})


router.post('/prompt_submit', function (req, res, next) {
  const idinexcelpage = req.query.id;

  nlp2sqlcontroller.prompt_post(req, res);
})
router.get('/update_excel?:id', async (req, res) => {
  const excelId = req.query.id;

  try {
    const excel = await ExcelFile.findById(excelId);
    if (!excel) {
      return res.status(404).send('Excel file not found.');
    }
    res.render('update_excel', { excel, excelId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error getting Excel file.');
  }
});

router.post('/update_excel/:id', upload.single('excel_file'), async (req, res) => {
  excel2sqlcontroller.update_excel(req, res);
});
router.get('/delete_excel', excel2sqlcontroller.delete_excel);
router.get('/delete_descriptions', excel2sqlcontroller.delete_descriptions)

router.get('/update_descriptions', async function (req, res, next) {
  try {

    const excelId = req.query.id; // ID of the ExcelFile document

    const descriptionIndex = parseInt(req.query.index, 10) || 0; // Index of the description to be updated (parsed as integer from query parameter)

    // Find the ExcelFile document by ID
    const excelFile = await ExcelFile.findById(excelId);

    // Get the existing description and result values
    const existingDescription = excelFile.descriptions[descriptionIndex];
    const existingResult = excelFile.results[descriptionIndex];

    // Render the update_description template with the existing values
    res.render('update_description', {
      excelId: excelId,
      descriptionIndex: descriptionIndex,
      existingDescription: existingDescription,
      existingResult: existingResult
    });

  } catch (err) {
    next(err);
  }
});
router.post('/update_descriptions', async function (req, res, next) {
  try {
    console.log("1");
    const excelId = req.body.excelId; // ID of the ExcelFile document
    const descriptionIndex = req.body.descriptionIndex; // Index of the description to be updated
    const description = req.body.description; // Updated description text
    const result = req.body.result; // Updated result text

    // Find the ExcelFile document by ID
    const excelFile = await ExcelFile.findById(excelId);

    // Update the specified description and result in the arrays
    excelFile.descriptions[descriptionIndex] = description;
    excelFile.results[descriptionIndex] = result;

    // Save the updated document
    await excelFile.save();

    // Redirect back to the ExcelFile details page
    res.redirect('/details?id=' + excelId);

  } catch (err) {
    next(err);
  }
});
router.get('/queries/:id/rowdetail', async (req, res) => {
  const queryId = req.params.id;
  console.log("this is the queryId");
  console.log(queryId);

  try {
    const query = await SQLQuery.findById(queryId);
    const rows = query.rows;

    console.log("this is the query");
    console.log(query.query);
    console.log("these are the rows");
    console.log(rows);

    res.render('rowdetail', { query, rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving query results' });
  }
});











module.exports = router;
