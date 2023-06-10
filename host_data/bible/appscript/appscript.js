//CREATE GOOGLE SHEET IN GOOGLE DRIVE => SAMPLE LINK => https://github.com/nextcodelab/data-base-server/raw/main/host_data/bible/appscript/notebook_sample.xlsx
//COPY THIS SCRIPT TO YOUR GOOGLE APPS sCRIPT

function doPost(request) {
  
  // Open Google Sheet using ID
  var sheet = SpreadsheetApp.openById("YOUR_GOOGLE_SHEET_ID");
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
  var sheet = SpreadsheetApp.openById("YOUR_GOOGLE_SHEET_ID");

  var data = getData(sheet);
  var json = getAsJson(data);
  return json;

}
function getData(sheet) {
  //Download sheet data as json
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  var rowList = [];
  var data = [];
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
function getAsJson(data) {
  var json = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return json;
}
