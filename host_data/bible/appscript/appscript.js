//https://developers.google.com/apps-script/reference/spreadsheet

//CREATE GOOGLE SHEET IN GOOGLE DRIVE
//COPY THIS SCRIPT TO YOUR GOOGLE APPS sCRIPT -> Extensions -> Apps Script
//DEPLOY AS WEB APP WITH "ANYONE" ACCESS => THEN COPY SCRIPT LINK
//ABOUT APPS SCRIPTS & SETUP -> https://www.youtube.com/watch?v=3UJ6RnWTGIY&t=494s


var sheetId = "REPLACE WITH YOUR SHEET_ID";
//Post and replace json
function doPost(e) {
  try {
    // Get the action from the query parameter
    var action = e.parameter.action;

    // Get the JSON data from the request
    var jsonData = e.postData.contents;
    CRUD.appendLongTextToSheet(jsonData);

    // Return success response
    var result = ContentService.createTextOutput("Data processed successfully.").setMimeType(ContentService.MimeType.TEXT);
    return result;
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput("Error: " + error.message).setMimeType(ContentService.MimeType.TEXT);
  }
}
//Get json
function doGet(e) {
  var result = CRUD.retrieveLongTextFromSheet();
  result = ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.JSON);
  return result; // This will return the JSON data to the client
}
//DATABASE OPERATIONS
var CRUD = {
  appendLongTextToSheet: function (longText) {
    var sheet = SpreadsheetApp.openById(sheetId);
    var numRows = sheet.getLastRow();

    // Delete all rows, starting from row 2 to numRows
    if (numRows > 1) {
      sheet.deleteRows(2, numRows);
    }
    if (numRows > 0) {
      sheet.getRange("A:AC").clearContent();
    }
    var data = longText;
    // write content to a new row created, no 50k error!
    sheet.appendRow([data]);
  },
  retrieveLongTextFromSheet: function () {
    var sheet = SpreadsheetApp.openById(sheetId);
    var numRows = sheet.getLastRow();

    // return empty string if no data
    if (numRows === 0) {
      return "";
    }
    var allVals = sheet.getActiveSheet().getDataRange().getValues();
    return allVals;
  },

}
