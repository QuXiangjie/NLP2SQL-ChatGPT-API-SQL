const mongoose = require('mongoose');
const { Schema } = mongoose;

const RowSchema = new Schema(
  {},
  { strict: false } // Set the strict option to false to allow dynamic keys
);

const SQLQuerySchema = new Schema({
  query: { type: String, required: true },
  rows: [RowSchema]
});

const SQLQuery = mongoose.model('SQLQuery', SQLQuerySchema);

module.exports = SQLQuery;
