var express = require('express');
var router = express.Router();
var nlp2sqlcontroller = require("../controllers/nlp2sqlcontrollers")

const DatabaseController = require('../controllers/databasecontroller');
const excel2sqlcontroller = require('../controllers/excel2sqlcontrollers');
const SQLQuery = require('../models/SQLQuery')
//for excel
const upload = require('multer')();
//for excel
const util = require('util');


/* GET users listing. */

const ExcelFile = require("../models/ExcelFile")

router.post('/executeQuery', (req, res) => {
  const excelId = req.query.id; // Extract the excelId from the query parameters
  console.log("this is exceID+", excelId)
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
  res.render('index', { excelFiles });
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
    const queries = await SQLQuery.find({});
    queries.forEach(query => {
      console.log(query.rows); // Access the 'rows' property for each query
    });

    // Render the update_description template with the existing values
    res.render('update_description', {
      excelId: excelId,
      descriptionIndex: descriptionIndex,
      existingDescription: existingDescription,
      existingResult: existingResult,
      queries:queries
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

const ExcelJS = require('exceljs');

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

router.get('/downloadQueryRows/:id', async (req, res) => {
  const queryId = req.params.id;

  try {
    const query = await SQLQuery.findById(queryId);
    console.log(query)
    const rows = query.rows;
    console.log(rows)
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Query Results');

    // Add the headers
    if (rows && rows.length > 0) {
      const keys = Object.keys(rows[0]);
      keys.forEach((key) => {
        if (key !== '_doc' && !key.startsWith('__') && !key.startsWith('$')) {
          worksheet.getCell(`${String.fromCharCode(65 + keys.indexOf(key))}1`).value = key;
        }
      });
    }

    // Add the rows
    if (rows && rows.length > 0) {
      rows.forEach((row, rowIndex) => {
        const rowKeys = Object.keys(row);
        rowKeys.forEach((key, keyIndex) => {
          if (key !== '_doc' && !key.startsWith('__') && !key.startsWith('$')) {
            worksheet.getCell(`${String.fromCharCode(65 + keyIndex)}${rowIndex + 2}`).value = row[key];
          }
        });
      });
    }

    // Generate a unique filename for the Excel file
    const fileName = `QueryResults_${queryId}.xlsx`;

    // Set the response headers for downloading the file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // Save the workbook and send it as the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating Excel file' });
  }
});




const { Configuration, OpenAIApi } = require("openai");
router.post('/translate', async (req, res) => {
  
  const configuration = new Configuration({
    apiKey: process.env['chatgptApiKey'], // Replace with your API key
  });

  const openai = new OpenAIApi(configuration);
  const { prompt, userInput } = req.body;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userInput }
      ],
    });

    const translatedSQL = response.data.choices[0].message.content;
    res.json({ translatedSQL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Translation failed" });
  }
});

module.exports = router;
