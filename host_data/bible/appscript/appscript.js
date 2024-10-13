[https://developers.google.com/apps-script/reference/spreadsheet](https://developers.google.com/apps-script/reference/spreadsheet)

//CREATE GOOGLE SHEET IN GOOGLE DRIVE
//COPY THIS SCRIPT TO YOUR GOOGLE APPS sCRIPT -> Extensions -> Apps Script
//DEPLOY AS WEB APP WITH "ANYONE" ACCESS => THEN COPY SCRIPT LINK
[ABOUT APPS SCRIPTS & SETUP](https://www.youtube.com/watch?v=3UJ6RnWTGIY&t=494s)


function doPost(e) {
  try {
    // Ensure headers are created first
    createNotebookHeaders();

    // Get the JSON data from the request
    const jsonData = JSON.parse(e.postData.contents);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet(); // Get the currently active sheet
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Create mappings of existing entries by book and unique_id
    const existingEntriesByBook = {};
    const existingEntriesByUniqueId = {};
    const existingData = sheet.getDataRange().getValues();

    for (let i = 1; i < existingData.length; i++) {
      const row = existingData[i];
      const type = row[0];
      const book = row[6]; // Assuming book is in the 7th column
      const unique_id = row[1]; // Assuming unique_id is in the 2nd column

      // Use book as the identifier for highlights, bookmarks, and references
      if (type === "highlight" || type === "bookmark" || type === "reference") {
        if (!existingEntriesByBook[book]) {
          existingEntriesByBook[book] = []; // Initialize as an array
        }
        existingEntriesByBook[book].push({ type, rowIndex: i + 1 }); // Store type and row index (1-based)
      }
      
      // Use unique_id as the identifier for hymns, sections, and pages
      if (type === "hymn" || type === "section" || type === "page") {
        existingEntriesByUniqueId[unique_id] = i + 1; // Store row index (1-based)
      }
    }

    // Iterate over each SectionServiceCloud object
    jsonData.forEach(item => {
      let rowIndex;

      // Determine rowIndex based on type (use book or unique_id)
      if (item.type === "highlight" || item.type === "bookmark" || item.type === "reference") {
        const entries = existingEntriesByBook[item.book] || [];
        entries.forEach(entry => {
          if (entry.type === item.type) {
            rowIndex = entry.rowIndex; // Match by type
          }
        });
      } else if (item.type === "hymn" || item.type === "section" || item.type === "page") {
        rowIndex = existingEntriesByUniqueId[item.unique_id]; // Match by unique_id
      }

      // If an existing entry is found, delete it
      if (rowIndex) {
        sheet.deleteRow(rowIndex); // Delete the existing row
      }

      // Insert the new row
      const row = [
        item.type,
        item.unique_id,
        item.title,
        item.section_id,
        item.notes,
        item.date,
        item.book,
        item.reference,
        item.content,
        item.link
      ];
      sheet.appendRow(row);
    });

    return ContentService.createTextOutput("Data added/updated successfully.");
  } catch (error) {
    return ContentService.createTextOutput(`Error: ${error.message}`);
  }
}




function createNotebookHeaders() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getActiveSheet(); // Get the currently active sheet

  // Define the headers in lowercase
  const headers = [
    "type",
    "unique_id",
    "title",
    "section_id",
    "notes",
    "date",
    "book",
    "reference",
    "content",
    "link"
  ];

  // Check if the sheet is empty
  if (sheet.getLastRow() === 0) {
    // Set the headers in the first row
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    // Make the headers bold
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    Logger.log("Headers created in the active sheet.");
  } else {
    // Get the existing headers from the active sheet
    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Check if the unique_id header exists
    if (!existingHeaders.includes("unique_id")) {
      // Set the headers in the first row
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      // Make the headers bold
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      Logger.log("Headers created in the active sheet.");
    } else {
      Logger.log("Headers already exist in the active sheet.");
    }
  }

  // Freeze the first row to keep headers visible while scrolling
  sheet.setFrozenRows(1);
}

function doGet(request) {
  // Ensure headers are created first
  createNotebookHeaders();

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getActiveSheet(); // Get the currently active sheet

  var unique_id = request.parameter.unique_id;
  var book = request.parameter.book; // Assuming book is the reference in your current context
  var action = request.parameter.action;

  var hasBook = book && book.toString().trim() !== '';

  if (action === "find" || action === "query" || action === "delete") {
    var data = sheet.getDataRange().getValues();
    var rowData = data.find(function (row, index) {
      if (index !== 0) {
        // If book is provided, find by book (7th column)
        if (hasBook && row[6] === book) {
          return row;
        } else if (row[1] === unique_id) { // Check by unique_id (2nd column)
          return row;
        }
      }
    });

    if (rowData) {
      var item = {
        type: rowData[0],            // Type (1st column)
        unique_id: rowData[1],       // Unique ID (2nd column)
        title: rowData[2],           // Title (3rd column)
        section_id: rowData[3],      // Section ID (4th column)
        notes: rowData[4],           // Notes (5th column)
        date: rowData[5],            // Date (6th column)
        book: rowData[6],            // Book (7th column)
        reference: rowData[7],       // Reference (8th column)
        content: rowData[8],         // Content (9th column)
        link: rowData[9]             // Link (10th column)
      };

      // If action is 'delete', remove the row
      if (action === 'delete') {
        var rowIndex = data.findIndex(function (row) {
          return row[1] === unique_id; // Find row by unique_id
        });
        if (rowIndex !== -1) {
          sheet.deleteRow(rowIndex + 1); // Add 1 to account for header row
        }
      }

      return ContentService
        .createTextOutput(JSON.stringify(item))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      var errorMessage = {
        "error": "No item found"
      };
      return ContentService
        .createTextOutput(JSON.stringify(errorMessage))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    return getAll(); // Call your existing getAll function to return all items
  }
}


function getAll() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getActiveSheet(); // Get the currently active sheet

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  // Get headers from the first row
  const headers = values[0];
  const jsonData = [];

  // Iterate through rows and create JSON objects
  for (let i = 1; i < values.length; i++) {
    let jsonObject = {};
    for (let j = 0; j < headers.length; j++) {
      jsonObject[headers[j]] = values[i][j];
    }
    jsonData.push(jsonObject);
  }

  // Return JSON response
  return ContentService.createTextOutput(JSON.stringify(jsonData))
    .setMimeType(ContentService.MimeType.JSON);
}
