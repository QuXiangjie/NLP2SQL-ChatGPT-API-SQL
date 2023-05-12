const ExcelFile = require("../models/ExcelFile");

exports.prompt_post = async function (req, res) {
  const idinexcelpage = req.query.id;
  console.log(idinexcelpage);
  const excel = await ExcelFile.findOne({ _id: idinexcelpage });
  const description = req.body.description;
  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    apiKey: process.env['chatgptApiKey'],  //protect the chatgptAPIKey
  });
  const sheets = excel.sheets;
  let messages = [
    { role: "system", content: `There are ${sheets.length} sheets in the Excel file: ${sheets.map(sheet => sheet.name).join(', ')}.` },
  ];
  sheets.forEach(sheet => {
    messages.push({ role: "system", content: `The headers in sheet "${sheet.name}" are: ${sheet.headers.join(', ')}.` });
  });
  messages.push(
    { role: "user", content: description },
    { role: "system", content: "Please assume the sheet name is table name, and the header name is colunm name, and according to description, Only give me the SQL answer " },
    { role: "system", content: "If user ask assistant to give him first row, Please don't use limit, use TOP " }
  )
  const openai = new OpenAIApi(configuration);

  const presencePenalty = req.body.presence_penalty || 0.5;
  const frequencyPenalty = req.body.frequency_penalty || 0.5;
  const temperature = req.body.temperature || 0.5;

  console.log(req.body.presence_penalty)

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    presence_penalty: parseFloat(presencePenalty),
    frequency_penalty: parseFloat(frequencyPenalty),
    temperature: parseFloat(temperature)
  });


  let result = response.data.choices[0].message.content;
  console.log(result)

  // Add the result and description to the ExcelFile document
  excel.descriptions.push(description);
  excel.results.push(result);
  await excel.save();

  res.redirect(`/details?id=${idinexcelpage}`);
};



exports.details = async function (req, res) {
  const idinexcelpage = req.query.id;
  console.log(idinexcelpage);
  const excel = await ExcelFile.findOne({ _id: idinexcelpage });
  const descriptions = excel.descriptions;
  const results = excel.results;
  res.render('details', { excel: excel });
};

