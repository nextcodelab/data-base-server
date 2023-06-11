//https://developers.google.com/apps-script/reference/spreadsheet

//CREATE GOOGLE SHEET IN GOOGLE DRIVE => SAMPLE LINK => https://github.com/nextcodelab/data-base-server/raw/main/host_data/bible/appscript/notebook_sample.xlsx
//COPY THIS SCRIPT TO YOUR GOOGLE APPS sCRIPT
//ABOUT APPS SCRIPTS => https://www.youtube.com/watch?v=3UJ6RnWTGIY&t=494s

var sheetId = "YOUR_GSheet_ID";
function doPost(request) {

  // Open Google Sheet using ID
  var sheet = SpreadsheetApp.openById(sheetId);
  var result = { "status": "SUCCESS" };
  try {
    //var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    //var newSheet = activeSpreadsheet.insertSheet();
    //newSheet.setName("whatever");
    //check parameter conditions

    var queryArray = request.queryString.split("=");
    if (queryArray[0] === "GET") {
      //sheet = SpreadsheetApp.getActive().getSheetByName(str);
      var data = getData(sheet);
      var json = getAsJson(request);
      result = json;
    }
    else if (queryArray[0] === "POST") {
      // Get all Parameters
      var unique_id = request.parameter.unique_id;
      var type = request.parameter.type;
      var book = request.parameter.book;
      var title = request.parameter.title;
      var message = request.parameter.message;
      var notes = request.parameter.notes;
      var link = request.parameter.link;
      var color = request.parameter.color;
      // Append data on Google Sheet
      var rowData = sheet.appendRow([unique_id, type, book, title, message, notes, link, color]);
      result = "POST";
    }
    else {
      var data = getData(sheet);
      var json = getAsJson(data);
      result = json;
    }


    // Append data on Google Sheet
    //var rowData = sheet.appendRow([unique_id, type, book, title, message, notes, link, color]);
    //result = request;
    console.log('Good', "List");


  } catch (exc) {
    // If error occurs, throw exception
    result = { "status": "FAILED", "message": exc.message };
    console.log('Failed with error %s', exc.message);
  }

  // Return result
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
function doGet(request) {
  // Open Google Sheet using ID

  // Get all Parameters
  // Open Google Sheet using ID
  var sheet = SpreadsheetApp.openById(sheetId);
  var data = getData(sheet);
  var json = getAsJson(data);
  return json;

}
//All code testing is here.
function testCode(){

}
//Customs
function getData(sheet) {
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  var rowList = [];
  var data = [];
  //Do not include the header so start with i = 1.
  for (var i = 1; i <= numRows - 1; i++) {
    var row = values[i];
    rowList.push(row);
    Logger.log(row);

    var item = {};
    item["unique_id"] = row[0];
    item["type"] = row[1];
    item["book"] = row[2];
    item["title"] = row[3];
    item["message"] = row[4];
    item["notes"] = row[5];
    item["link"] = row[6];
    item["color"] = row[7];
    data.push(item);
  }
  return data;
}






//LIBRARIES
function getAsJson(data) {
  var json = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return json;
}
function updateSheet(row, column, newValue) {
  var activeSheet = SpreadsheetApp.openById(sheetId);
  var cell = getCell(activeSheet, row, column);
  Logger.log("old-value: " + cell.getValue());
  //updateValue(cell, newValue);
  Logger.log("new-value: " + newValue);


}
//Always start with 1 not zero, HEADER is included
function getCell(sheet, row, column) {
  if (row == 0) {
    row = 1;
  }
  // Example C2, C is the column horizontal alphabet (ABC), 2 is the row vertical number.
  var positionCode = getLetter(column) + "" + row;
  Logger.log("HEADER: " + sheet.getRange(alphabet[column] + "" + 1).getValue());
  return sheet.getRange(positionCode);
}
//Update value in specific cell
function updateValue(cell, newValue) {
  cell.setValue(newValue);
}
//Find cells with HEADER that has value of.
function findCells(withHeader, withValueOf) {
  //withHeader = "book"; 
  //withValueOf = "John 1:1";
  var activeSheet = SpreadsheetApp.openById(sheetId);
  var rows = activeSheet.getDataRange().getValues();
  var columns = rows[0];
  var letter = "";
  var results = [];
  var index = 0;
  var indexFound = 0
  columns.forEach(c => {
    if (c == withHeader) {
      letter = getLetter(index + 1);
      indexFound = index;
    }
    index++;
  });
  if (letter != "") {
    var rowCounter = 1;
    rows.forEach(r => {
      var val = r[indexFound];
      if (val == withValueOf) {
        var positionCode = letter + "" + rowCounter;
        Logger.log(positionCode);//Example C36
        var cell = activeSheet.getRange(positionCode)
        results.push(cell);
      }
      rowCounter++;
    });
  }

  return results;
}




//HELPERS
function getLetter(column) {
  if (column > 0) {
    column = column - 1;
  }
  const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  return alphabet[column];
}
