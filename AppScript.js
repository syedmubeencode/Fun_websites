const DATA_ENTRY_SHEET_NAME = "Sheet1";
const TIME_STAMP_COLUMN_NAME = "Timestamp";
var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_ENTRY_SHEET_NAME);

const doPost = (request = {}) => {
  try {
    // Log the incoming request for debugging
    Logger.log("Received request: " + JSON.stringify(request));
    
    const { postData } = request;
    
    // Check if postData is missing
    if (!postData || !postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ error: "No postData received" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const { contents } = postData;
    Logger.log("Post data contents: " + contents); // Log the contents for debugging

    // Parse the form data
    var data = parseFormData(contents);

    // Append to the Google Sheet
    appendToGoogleSheet(data);

    // Return a success response
    return ContentService.createTextOutput(JSON.stringify({ success: true, data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    Logger.log("Error: " + e.toString());
    return ContentService.createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
};

function parseFormData(postData) {
  // Handle undefined or empty postData
  if (!postData) return {};

  var data = {};
  var parameters = postData.split('&');
  
  // Parse each parameter
  for (var i = 0; i < parameters.length; i++) {
    var keyValue = parameters[i].split('=');
    data[keyValue[0]] = decodeURIComponent(keyValue[1] || ""); // Handle empty values
  }

  return data;
}

function appendToGoogleSheet(data) {
  // Add timestamp to the data
  if (TIME_STAMP_COLUMN_NAME !== "") {
    data[TIME_STAMP_COLUMN_NAME] = new Date();
  }

  // Get the headers from the sheet
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Map the data to the correct columns
  var rowData = headers.map(headerFld => data[headerFld]);

  // Append the row data to the sheet
  sheet.appendRow(rowData);
}
