const mongoose = require('mongoose');
const { Schema } = mongoose;

const RowSchema = new Schema(
  {},
  { strict: false } // Set the strict option to false to allow dynamic keys
);

const SheetSchema = new Schema({
  name: { type: String, required: true },
  headers: [{ type: String, required: true }],
  rows: [RowSchema],
});

const ExcelFileSchema = new Schema({
  fileName: { type: String, required: true },
  sheets: [SheetSchema],
  results: [{ type: String }],
  descriptions: [{ type: String }]
});

const ExcelFile = mongoose.model('ExcelFile', ExcelFileSchema);
const Sheet = mongoose.model('Sheet', SheetSchema);
const Row = mongoose.model('Row', RowSchema);

module.exports = ExcelFile;
