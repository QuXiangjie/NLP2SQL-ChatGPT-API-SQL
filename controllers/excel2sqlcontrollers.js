const xlsx = require('xlsx');
const nlp2sqlcontrollers = require('./nlp2sqlcontrollers');
const mongoose = require('mongoose');
const ExcelFile = require("../models/ExcelFile")
const SQLQuery = require("../models/SQLQuery");

exports.getExcelHeader = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  const workbook = xlsx.read(req.file.buffer);
  const sheetNames = workbook.SheetNames;
  const sheets = [];
  // loop through each sheet to get its headers and rows
  for (let i = 0; i < sheetNames.length; i++) {
    const sheetName = sheetNames[i];
    const worksheet = workbook.Sheets[sheetName];
    const headers = [];
    const rows = [];
    // loop through the first row to get the headers
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    for (let c = range.s.c; c <= range.e.c; c++) {
      const address = xlsx.utils.encode_cell({ r: range.s.r, c });
      const cell = worksheet[address];
      if (cell && cell.t === 's') {
        headers.push(cell.v);
      }
    }
    // get all the rows of the sheet
    // get the first 5 rows of the sheet
    for (let r = range.s.r + 1; r <= range.s.r + 5 && r <= range.e.r; r++) {
      const rowData = {};
      for (let c = range.s.c; c <= range.e.c; c++) {
        const address = xlsx.utils.encode_cell({ r, c });
        const cell = worksheet[address];
        rowData[headers[c]] = cell ? cell.v : null;
      }
      rows.push(rowData);
    }



    sheets.push({ name: sheetName, headers: headers, rows: rows});
  }
  // save the excel file info in MongoDB
  const excelFile = new ExcelFile({
    fileName: file.originalname,
    sheets: sheets,
  });
  await excelFile.save();
  res.redirect('/');
};




exports.getExcelpage_get = async function (req, res, excelId) {
  if (!excelId) {
    return res.status(400).send('No Excel file ID provided.');
  }

  try {
    const excel = await ExcelFile.findOne({ _id: excelId });
    
    if (!excel) {
      return res.status(404).send('Excel file not found.');
    }

    const queries = await SQLQuery.find({});
    queries.forEach(query => {
      console.log(query.rows); // Access the 'rows' property for each query
    });
    console.log("this is the excelid");
    

    res.render('details', { 
      fileName: excel.fileName,
      excel: excel,
      id: excelId,
      queries: queries
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error.');
  }
}



exports.getExcelpage_post = async function (req, res) {
  nlp2sqlcontrollers.prompt_post(req, res)

}
exports.update_excel = async function (req, res) {
  const file = req.file;
  const excelId = req.params.id;

  if (!file || !excelId) {
    return res.status(400).send('Invalid request.');
  }

  try {
    const workbook = xlsx.read(file.buffer);
    const sheetNames = workbook.SheetNames;
    const sheets = [];

    // loop through each sheet to get its headers and rows
    for (let i = 0; i < sheetNames.length; i++) {
      const sheetName = sheetNames[i];
      const worksheet = workbook.Sheets[sheetName];
      const headers = [];
      const rows = [];

      // loop through the first row to get the headers
      const range = xlsx.utils.decode_range(worksheet['!ref']);
      for (let c = range.s.c; c <= range.e.c; c++) {
        const address = xlsx.utils.encode_cell({ r: range.s.r, c });
        const cell = worksheet[address];
        if (cell && cell.t === 's') {
          headers.push(cell.v);
        }
      }

      // get all the rows of the sheet
      // get the first 5 rows of the sheet
      for (let r = range.s.r + 1; r <= range.s.r + 5 && r <= range.e.r; r++) {
        const rowData = {};
        for (let c = range.s.c; c <= range.e.c; c++) {
          const address = xlsx.utils.encode_cell({ r, c });
          const cell = worksheet[address];
          rowData[headers[c]] = cell ? cell.v : null;
        }
        rows.push(rowData);
      }

      sheets.push({ name: sheetName, headers: headers, rows: rows });
    }

    // update the excel file info in MongoDB
    const excel = await ExcelFile.findById(excelId);
    if (!excel) {
      return res.status(404).send('Excel file not found.');
    }
    excel.fileName = file.originalname;
    excel.sheets = sheets;
    await excel.save();

    res.redirect(`/details?id=${excelId}`);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating Excel file.');
  }
}
exports.delete_excel = async function (req, res) {
  try {
    const excelId = req.query.id;
    console.log(excelId);
    await ExcelFile.findByIdAndDelete(excelId);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
}
exports.delete_descriptions = async function (req, res, next) {
  try {

    const excelId = req.query.id; // ID of the ExcelFile document
    const descriptionIndex = parseInt(req.query.index, 10) || 0; // Index of the description to be deleted (parsed as integer from query parameter)


    // Find the ExcelFile document by ID
    const excelFile = await ExcelFile.findById(excelId);

    // Delete the specified description and result from the arrays
   console.log(excelFile);
    excelFile.descriptions.splice(descriptionIndex, 1);
   
    excelFile.results.splice(descriptionIndex, 1);


    // Save the updated document
    await excelFile.save();
    const queries = await SQLQuery.find({});
    queries.forEach(query => {
      console.log(query.rows); // Access the 'rows' property for each query
    });

    // Redirect back to the ExcelFile details page
    res.render('details', { fileName: excelFile.fileName, excel: excelFile, id: excelId,queries:queries });

  } catch (err) {
    next(err);
  }

}

