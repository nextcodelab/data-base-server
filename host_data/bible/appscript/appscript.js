[https://developers.google.com/apps-script/reference/spreadsheet](https://developers.google.com/apps-script/reference/spreadsheet)

//CREATE GOOGLE SHEET IN GOOGLE DRIVE
//COPY THIS SCRIPT TO YOUR GOOGLE APPS sCRIPT -> Extensions -> Apps Script
//DEPLOY AS WEB APP WITH "ANYONE" ACCESS => THEN COPY SCRIPT LINK
[ABOUT APPS SCRIPTS & SETUP](https://www.youtube.com/watch?v=3UJ6RnWTGIY&t=494s)

// Please be aware of quotas in retrieval per cell in Google account.
// The last known limit is 500,000 cells per day.
                             
//Copy code below only, do not include above info...                           
function doPost(request) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var result = { "status": "SUCCESS" };
  createFixedHeaders();

  try {
    // Extract parameters from the request
    var type = request.parameter.type;
    var unique_id = request.parameter.unique_id;
    var section_id = request.parameter.section_id;
    var title = request.parameter.title;
    var content = request.parameter.content;
    var notes = request.parameter.notes;
    var date = request.parameter.date;
    var date_updated = request.parameter.date_updated;
    var link = request.parameter.link;

    // Validate that unique_id is provided
    if (!unique_id || unique_id.trim() === '') {
      throw new Error("Unique ID is required");
    }

    // Use TextFinder to search for the unique_id
    var textFinder = sheet.createTextFinder(unique_id);
    var matchedCells = textFinder.findAll();
    var rowsToDelete = [];

    // Loop through matched cells and find all rows with the correct type
    for (var i = 0; i < matchedCells.length; i++) {
      var row = matchedCells[i].getRow();
      var rowType = sheet.getRange(row, 1).getValue(); // Assuming the type is in the first column

      // Check if both unique_id and type match
      if (rowType === type) {
        rowsToDelete.push(row); // Store the row index in the list
      }
    }

    // Sort the row indices in descending order to avoid row shifting issues
    rowsToDelete.sort(function(a, b) { return b - a; });

    // Delete the rows from bottom to top
    for (var j = 0; j < rowsToDelete.length; j++) {
      sheet.deleteRow(rowsToDelete[j]);
    }

    // Append the new or updated row
    var rowData = [type, unique_id, section_id, title, content, notes, date, date_updated, link];
    sheet.appendRow(rowData);

  } catch (exc) {
    result.status = "ERROR";
    result.message = exc.message;

    writeToSheet('Failed with error: ' + exc.message);
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}


function doGet(request) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var amount = parseInt(request.parameter.amount) || 50; // Default limit of 50
  var action = request.parameter.action;
  var unique_id = request.parameter.unique_id;
  var type = request.parameter.type;

  // Check if action is to limit the items
  if (action === "limit") {
    var lastRow = sheet.getLastRow();
    var totalDataRows = lastRow - 1; // Exclude header row

    if (totalDataRows > amount) {
      var startRow = Math.max(2, lastRow - amount + 1);
      var dataRange = sheet.getRange(startRow, 1, lastRow - startRow + 1, sheet.getLastColumn());
      var data = dataRange.getValues();

      // Map data to JSON format
      var items = data.map(function (row) {
        return {
          type: row[0],
          unique_id: row[1],
          section_id: row[2],
          title: row[3],
          content: row[4],
          notes: row[5],
          date: row[6],
          date_updated: row[7],
          link: row[8], // Corrected to link the right column index
        };
      });

      return ContentService
        .createTextOutput(JSON.stringify(items))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Check if action is to delete an item
  if (action === "delete" && unique_id && unique_id.trim() !== "") {
    var textFinder = sheet.createTextFinder(unique_id);
    var matchedCells = textFinder.findAll();
    var rowIndexToDelete = -1;

    // Loop through matched cells to find the correct row with the specified type
    for (var i = 0; i < matchedCells.length; i++) {
      var row = matchedCells[i].getRow();
      var rowType = sheet.getRange(row, 1).getValue(); // Assuming type is in the first column

      // Check if the row's type matches the specified type
      if (rowType === type) {
        rowIndexToDelete = row;
        break; // Stop once the correct row is found
      }
    }

    // Delete the row if found
    if (rowIndexToDelete !== -1) {
      sheet.deleteRow(rowIndexToDelete);
      return ContentService
        .createTextOutput(JSON.stringify({ status: "DEBUG_INFO_MESSAGE: SUCCESS", message: "Row with type '" + type + "' deleted." }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "DEBUG_INFO_MESSAGE: ERROR", message: "Unique ID not found or type mismatch." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Default action
  return getAll(); // Assume getAll() is defined elsewhere and optimized
}


function getAll() {
  var sheet = SpreadsheetApp.getActive();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  var data = [];

  for (var i = 1; i < numRows; i++) {
    var row = values[i];
    var item = {
      type: row[0],
      unique_id: row[1],
      section_id: row[2],
      title: row[3],
      content: row[4],
      notes: row[5],
      date: row[6],
      date_updated: row[7],
      link: row[7],
    };
    data.push(item);
  }
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
function createFixedHeaders() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getActiveSheet(); // Get the currently active sheet

  // Define the headers in lowercase
  const headers = [
    "type",
    "unique_id",
    "section_id",
    "title",
    "content",
    "notes",
    "date",
    "date_updated",
    "link",
  ];

  // Check if the sheet is empty
  if (sheet.getLastRow() === 0) {
    // Set the headers in the first row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]); // 1 quota
    headerRange.setFontWeight("bold"); // 8 quotas for bold
    Logger.log("Headers created in the active sheet.");
  } else {
    // Check if the unique_id header exists without retrieving all headers
    const existingHeader = sheet.getRange(1, 2).getValue(); // Assuming unique_id is the second header
    if (existingHeader !== "unique_id") {
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]); // 1 quota
      headerRange.setFontWeight("bold"); // 8 quotas for bold
      Logger.log("Headers created in the active sheet.");
    } else {
      Logger.log("Headers already exist in the active sheet.");
    }
  }

  // Freeze the first row to keep headers visible while scrolling
  sheet.setFrozenRows(1); // Efficient, minimal quota usage
}

function getLastDataRowExcludingHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headerRows = 1; // Change this to the number of header rows in your sheet
  var lastRow = sheet.getLastRow(); // Gets the last row that contains data

  // Calculate the last data row, excluding headers
  var lastDataRow = lastRow > headerRows ? lastRow - headerRows : 0; // Ensure we don't go below zero

  Logger.log('Last Data Row (excluding headers): ' + lastDataRow);
  return lastDataRow;
}
function writeToSheet(logMessage) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("logs");

  if (sheet) {
    sheet.appendRow([new Date(), logMessage]);
  } else {
    Logger.log('Sheet "logs" not found');
  }
}

function testScript() {
  var mockRequest = {
    parameter: {
      type: "7889d0b9-efa9-47be-853d-b51aa853d06a",
      unique_id: "7889d0b9-efa9-47be-853d-b51aa853d06a",
      section_id: "ABC123",
      title: "Transaction Test",
      content: "Transaction Test",
      notes: "Transaction Test",
      date: "2024-10-09",
      date_updated: "updated date",
      link: "link",
    }
  };
  doPost(mockRequest);
}

function doGet(request) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var amount = parseInt(request.parameter.amount) || 50; // Default limit of 50
  var action = request.parameter.action;
  var unique_id = request.parameter.unique_id;
  var type = request.parameter.type;

  // Check if action is to limit the items
  if (action === "limit") {
    var lastRow = sheet.getLastRow();
    var totalDataRows = lastRow - 1; // Exclude header row

    if (totalDataRows > amount) {
      var startRow = Math.max(2, lastRow - amount + 1);
      var dataRange = sheet.getRange(startRow, 1, lastRow - startRow + 1, sheet.getLastColumn());
      var data = dataRange.getValues();

      // Map data to JSON format
      var items = data.map(function (row) {
        return {
          type: row[0],
          unique_id: row[1],
          section_id: row[2],
          title: row[3],
          content: row[4],
          notes: row[5],
          date: row[6],
          date_updated: row[7],
          link: row[8], // Corrected to link the right column index
        };
      });

      return ContentService
        .createTextOutput(JSON.stringify(items))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Check if action is to delete an item
  if (action === "delete" && unique_id && unique_id.trim() !== "") {
    var textFinder = sheet.createTextFinder(unique_id);
    var matchedCells = textFinder.findAll();
    var rowIndexToDelete = -1;

    // Loop through matched cells to find the correct row with the specified type
    for (var i = 0; i < matchedCells.length; i++) {
      var row = matchedCells[i].getRow();
      var rowType = sheet.getRange(row, 1).getValue(); // Assuming type is in the first column

      // Check if the row's type matches the specified type
      if (rowType === type) {
        rowIndexToDelete = row;
        break; // Stop once the correct row is found
      }
    }

    // Delete the row if found
    if (rowIndexToDelete !== -1) {
      sheet.deleteRow(rowIndexToDelete);
      return ContentService
        .createTextOutput(JSON.stringify({ status: "DEBUG_INFO_MESSAGE: SUCCESS", message: "Row with type '" + type + "' deleted." }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "DEBUG_INFO_MESSAGE: ERROR", message: "Unique ID not found or type mismatch." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Default action
  return getAll(); // Assume getAll() is defined elsewhere and optimized
}


function getAll() {
  var sheet = SpreadsheetApp.getActive();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  var data = [];

  for (var i = 1; i < numRows; i++) {
    var row = values[i];
    var item = {
      type: row[0],
      unique_id: row[1],
      section_id: row[2],
      title: row[3],
      content: row[4],
      notes: row[5],
      date: row[6],
      date_updated: row[7],
      link: row[7],
    };
    data.push(item);
  }
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
function createFixedHeaders() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getActiveSheet(); // Get the currently active sheet

  // Define the headers in lowercase
  const headers = [
    "type",
    "unique_id",
    "section_id",
    "title",
    "content",
    "notes",
    "date",
    "date_updated",
    "link",
  ];

  // Check if the sheet is empty
  if (sheet.getLastRow() === 0) {
    // Set the headers in the first row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]); // 1 quota
    headerRange.setFontWeight("bold"); // 8 quotas for bold
    Logger.log("Headers created in the active sheet.");
  } else {
    // Check if the unique_id header exists without retrieving all headers
    const existingHeader = sheet.getRange(1, 2).getValue(); // Assuming unique_id is the second header
    if (existingHeader !== "unique_id") {
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]); // 1 quota
      headerRange.setFontWeight("bold"); // 8 quotas for bold
      Logger.log("Headers created in the active sheet.");
    } else {
      Logger.log("Headers already exist in the active sheet.");
    }
  }

  // Freeze the first row to keep headers visible while scrolling
  sheet.setFrozenRows(1); // Efficient, minimal quota usage
}

function getLastDataRowExcludingHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headerRows = 1; // Change this to the number of header rows in your sheet
  var lastRow = sheet.getLastRow(); // Gets the last row that contains data

  // Calculate the last data row, excluding headers
  var lastDataRow = lastRow > headerRows ? lastRow - headerRows : 0; // Ensure we don't go below zero

  Logger.log('Last Data Row (excluding headers): ' + lastDataRow);
  return lastDataRow;
}
function writeToSheet(logMessage) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("logs");

  if (sheet) {
    sheet.appendRow([new Date(), logMessage]);
  } else {
    Logger.log('Sheet "logs" not found');
  }
}

function testScript() {
  var mockRequest = {
    parameter: {
      type: "7889d0b9-efa9-47be-853d-b51aa853d06a",
      unique_id: "7889d0b9-efa9-47be-853d-b51aa853d06a",
      section_id: "ABC123",
      title: "Transaction Test",
      content: "Transaction Test",
      notes: "Transaction Test",
      date: "2024-10-09",
      date_updated: "updated date",
      link: "link",
    }
  };
  doPost(mockRequest);
}
