//https://developers.google.com/apps-script/reference/spreadsheet

//CREATE GOOGLE SHEET IN GOOGLE DRIVE
//COPY THIS SCRIPT TO YOUR GOOGLE APPS sCRIPT -> Extensions -> Apps Script
//DEPLOY AS WEB APP WITH "ANYONE" ACCESS => THEN COPY SCRIPT LINK
//ABOUT APPS SCRIPTS & SETUP -> https://www.youtube.com/watch?v=3UJ6RnWTGIY&t=494s


var sheetId = "REPLACE WITH YOUR SHEET_ID";
var tableHighlights = "highlights";
var tableBookmarks = "bookmarks";
var tableNotebooks = "note_books";
var tableNotebookItems = "note_book_items";
var tableLessons = "lessons";
var tableLessonItems = "lesson_items";
function doPost(e) {
  UI.initHeader();
  try {
    // Get the action from the query parameter
    var action = e.parameter.action;

    // Get the JSON data from the request
    var jsonData = e.postData.contents;

    // Parse the JSON data
    var jsonDataObj = JSON.parse(jsonData);

    // Determine the action based on the 'action' parameter
    if (action === "delete") {
      CRUD.deleteObject(jsonDataObj); // Call your delete function passing the JSON data
    } else if (action === "insert") {
      CRUD.insertObject(jsonDataObj); // Call your insert function passing the JSON data
    } else {
      throw new Error("Invalid action.");
    }

    // Return success response
    var result = ContentService.createTextOutput("Data processed successfully.").setMimeType(ContentService.MimeType.TEXT);
    return result;
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput("Error: " + error.message).setMimeType(ContentService.MimeType.TEXT);
  }
}


//Get all
function doGet() {
  UI.initHeader();
  var jsonDataObj = {};

  // List of table names
  var tableNames = [
    tableNotebooks,
    tableNotebookItems,
    tableLessons,
    tableLessonItems,
    tableBookmarks,
    tableHighlights
  ];

  // Iterate over each table and retrieve data
  tableNames.forEach(function (tableName) {
    var tableData = CRUD.retrieveDataFromTable(tableName);
    jsonDataObj[tableName] = tableData;
  });

  var jsonData = JSON.stringify(jsonDataObj, null, 2);
  Logger.log(jsonData);
  // Create a text output with the JSON data
  var result = ContentService.createTextOutput(jsonData).setMimeType(ContentService.MimeType.JSON);

  return result; // This will return the JSON data to the client
}


//SET-UP
var UI = {
  //TABLES
  initHeader() {
    // Notebook and Notebookitems
    var noteBookColumnNames = ["unique_id", "note_id", "title", "notes", "link"];
    var noteBookItemColumnNames = ["unique_id", "note_id", "notes", "book"];

    // Lessons and Lessonitems
    var lessonColumnNames = ["unique_id", "note_id", "title", "message", "notes", "link"];
    var lessonItemColumnNames = ["unique_id", "note_id", "message", "notes", "book"];

    // Bookmarks
    var bookmarkColumnNames = ["unique_id", "book"];

    // Highlights
    var highlightColumnNames = ["book", "hex", "notes"];

    // Set headers for the tables
    this.setHeaders(tableLessons, lessonColumnNames);
    this.setHeaders(tableLessonItems, lessonItemColumnNames);
    this.setHeaders(tableNotebooks, noteBookColumnNames);
    this.setHeaders(tableNotebookItems, noteBookItemColumnNames);
    this.setHeaders(tableBookmarks, bookmarkColumnNames);
    this.setHeaders(tableHighlights, highlightColumnNames);
    this.setWrap();
  },
  // Set headers and freeze the top row
  setHeaders: function (table, columnNames) {
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(table);
    if (!sheet) {
      // Create the sheet if it doesn't exist
      var newSheet = SpreadsheetApp.openById(sheetId).insertSheet(table);
      newSheet.getRange(1, 1, 1, columnNames.length).setValues([columnNames]);

      // Format header row
      var headerRow = newSheet.getRange(1, 1, 1, columnNames.length);
      headerRow.setFontWeight("bold");
      headerRow.setBackground("black");
      headerRow.setFontColor("white");
      headerRow.setHorizontalAlignment("center");
      headerRow.setVerticalAlignment("middle");
      // Set wrap strategy to "clip" for header cells
      headerRow.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

      // Freeze the top row
      newSheet.setFrozenRows(1);
      // Delete initial empty rows that come with the new sheet
      newSheet.deleteRows(2, 995);

    } else {
      // Sheet already exists, check if headers match
      var existingHeaders = sheet.getRange(1, 1, 1, columnNames.length).getValues()[0];
      var headersMatch = JSON.stringify(existingHeaders) === JSON.stringify(columnNames);

      if (!headersMatch) {
        // Headers don't match, update the headers
        sheet.getRange(1, 1, 1, columnNames.length).setValues([columnNames]);

        // Format header row (optional)
        var headerRow = sheet.getRange(1, 1, 1, columnNames.length);
        headerRow.setFontWeight("bold");
        headerRow.setBackground("black");
        headerRow.setFontColor("white");
        headerRow.setHorizontalAlignment("center");
        headerRow.setVerticalAlignment("middle");

        // Freeze the top row (optional)
        sheet.setFrozenRows(1);
        // Set wrap strategy to "clip" for header cells
        headerRow.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);


      }

    }
  },
  // Set wrap or clip for all cells except the header row
  setWrap: function () {
    var sheets = SpreadsheetApp.openById(sheetId).getSheets();
    sheets.forEach(function (sheet) {
      var lastRow = sheet.getLastRow();
      var lastColumn = sheet.getLastColumn();

      // Check if the sheet has data (at least one row)
      if (lastRow > 1) {
        var range = sheet.getRange(2, 1, lastRow - 1, lastColumn); // Start from row 2 to exclude the header row

        // Set wrap or clip for all cells in the range
        range.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
        // Alternatively, you can use SpreadsheetApp.WrapStrategy.CLIP to clip the content if it exceeds the cell boundaries

        // Adjust the column widths to fit the content
        for (var col = 1; col <= lastColumn; col++) {
          sheet.autoResizeColumn(col);
        }
      }
    });
  },
};



//DATABASE OPERATIONS
var CRUD = {
  //GET ALL
  retrieveDataFromTable: function (table) {
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(table);
    if (!sheet) {
      throw new Error("Table not found: " + table);
    }

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var headers = values[0];
    var data = [];

    // Iterate over rows (skip the header row at index 0) and convert them to objects
    for (var i = 1; i < values.length; i++) {
      var rowData = values[i];
      var rowObj = {};
      for (var j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = rowData[j];
      }
      data.push(rowObj);
    }

    return data;
  },

  // Insert data into the specified table
  insertData: function (table, data, columnNames) {
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(table);
    if (!sheet) {
      throw new Error("Table not found: " + table);
    }

    // Make sure data contains all columns defined in columnNames
    if (!columnNames.every((col) => col in data)) {
      throw new Error("Data object does not match column names.");
    }

    // Check if the table uses "book" as the unique identifier
    var uniqueIdentifierColumn = "unique_id";
    if (table === tableHighlights) {
      uniqueIdentifierColumn = "book";
    }

    var uniqueId = data[uniqueIdentifierColumn];
    if (!uniqueId || typeof uniqueId !== "string") {
      throw new Error("Invalid " + uniqueIdentifierColumn + " value.");
    }

    var existingRow = null;
    if (uniqueId !== "") {
      // Find row with matching unique_id/book, if it exists
      existingRow = this.findRowByUniqueId(table, uniqueIdentifierColumn, uniqueId);
    }

    if (existingRow) {
      // Update the existing row
      var rowIndex = existingRow.getRowIndex();
      var rowData = columnNames.map((col) => {
        if (data[col] !== undefined && data[col] !== null) {
          return data[col].toString();
        } else {
          return "";
        }
      });
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Insert a new row
      var rowData = columnNames.map((col) => {
        if (data[col] !== undefined && data[col] !== null) {
          return data[col].toString();
        } else {
          return "";
        }
      });
      sheet.appendRow(rowData);
    }
  },

  // Find a row by the specified identifier column and return the corresponding Range object
  findRowByUniqueId: function (table, identifierColumn, identifierColumnValue) {
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(table);
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var headers = values[0];
    var identifierIndex = headers.indexOf(identifierColumn);
    if (identifierIndex === -1) {
      throw new Error("Column '" + identifierColumn + "' not found.");
    }

    for (var i = 1; i < values.length; i++) {
      if (values[i][identifierIndex] === identifierColumnValue) {
        var rowIndex = i + 1; // Add 1 to adjust for header row
        return sheet.getRange(rowIndex, 1, 1, headers.length);
      }
    }

    return null; // Return null if the specified identifier is not found
  },

  // Delete a row of data from the specified sheet based on the specified identifier column and its value
  deleteData: function (table, identifierColumn, identifierColumnValue) {
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(table);
    if (!sheet) {
      throw new Error("Table not found: " + table);
    }

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var headers = values[0];
    var identifierIndex = headers.indexOf(identifierColumn);
    if (identifierIndex === -1) {
      throw new Error("Column '" + identifierColumn + "' not found.");
    }

    for (var i = 1; i < values.length; i++) {
      if (values[i][identifierIndex] === identifierColumnValue) {
        var rowIndex = i + 1; // Add 1 to adjust for header row
        sheet.deleteRow(rowIndex);
        return true; // Return true if deletion is successful
      }
    }

    return false; // Return false if the specified identifier is not found
  },

  //INSERT OR UPDATE
  //Insert or update items by json format include all tables and its value if it is not empty
  insertObject: function (jsonDataObj) {
    // Iterate over each table in the JSON data and insert the records
    for (var tableName in jsonDataObj) {
      if (jsonDataObj.hasOwnProperty(tableName)) {
        var tableData = jsonDataObj[tableName];
        if (tableData.length > 0) {
          this.insertDataIntoTable(tableName, tableData);
        }
      }
    }
  },

  insertDataIntoTable: function (tableName, data) {
    // Get the appropriate column names based on the keys in the first record
    var columnNames = Object.keys(data[0]);

    // Insert data into the table using the 'insertData' function
    data.forEach(record => {
      this.insertData(tableName, record, columnNames);
    });
  },


  //DELETE
  //Delete items by json format include all tables and its value if it is not empty
  deleteObject: function (jsonDataObj) {

    // Iterate over each table in the JSON data and insert or delete the records
    for (var tableName in jsonDataObj) {
      if (jsonDataObj.hasOwnProperty(tableName)) {
        var tableData = jsonDataObj[tableName];
        if (tableData.length > 0) {
          this.deleteDataFromTable(tableName, tableData);
        }
      }
    }
  },

  // Delete data from the specified table based on unique_id or book identifier
  deleteDataFromTable: function deleteDataFromTable(tableName, data) {
    // Check if the table has a unique_id column
    var hasUniqueId = data[0].hasOwnProperty("unique_id");

    // Get the unique identifier column name (unique_id or book)
    var uniqueIdentifierColumn = hasUniqueId ? "unique_id" : "book";

    // Delete records for each item in the tableData
    data.forEach(record => {
      // Get the unique_id or book value
      var uniqueId = record[uniqueIdentifierColumn];
      if (uniqueId && typeof uniqueId === "string") {
        // Find row with matching unique_id/book, if it exists, and delete the row
        var existingRow = this.findRowByUniqueId(tableName, uniqueIdentifierColumn, uniqueId);
        if (existingRow) {
          var rowIndex = existingRow.getRowIndex();
          var sheet = existingRow.getSheet();
          sheet.deleteRow(rowIndex);
        }
      }
    });
  },



};

