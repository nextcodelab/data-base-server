//https://developers.google.com/apps-script/reference/spreadsheet

//CREATE GOOGLE SHEET IN GOOGLE DRIVE => SAMPLE LINK => https://github.com/nextcodelab/data-base-server/raw/main/host_data/bible/appscript/notebook_sample.xlsx
//COPY THIS SCRIPT TO YOUR GOOGLE APPS sCRIPT -> Extensions -> Apps Script
//ABOUT APPS SCRIPTS & SETUP -> https://www.youtube.com/watch?v=3UJ6RnWTGIY&t=494s

var sheetId = "YOUR_GSheet_ID";
var activeSheet = SpreadsheetApp.openById(sheetId);
var resultLogger = ["v2"];
function doPost(request) {
  // Open Google Sheet using ID
  
  try {
   
    //check parameter conditions
    var queryArray = request.queryString.split("=");
    //Update if exist, add if not exist.
    resultLogger.push(queryArray[0]);
    if (queryArray[0] === "UPDATEIF") {
      
      var array = paramaterAsArray(request);
      var headerType = array[1];
      if (headerType === "highlight") {
        var newValue = array[2];
        var cells = filterCells("highlight");
        var selectInfoCell = null;
        for (var i = 0; i < cells.length; i++) {

          if (cells[i].row.includes(newValue)) {
            selectInfoCell = cells[i];
            break;
          }
        }
        if (selectInfoCell != null) {
          resultLogger.push("Updating row..." + cells)
          updateRow(request, selectInfoCell.rowNum);
        }
        else {
          resultLogger.push("adding row..." + cells)
          appendRow(array);
        }
      }
      else if (headerType === "bookmark") {
        var newValue = array[2];
        var cells = filterCells("bookmark");
        var selectInfoCell = null;
        for (var i = 0; i < cells.length; i++) {
          if (cells[i].row.includes(newValue)) {
            selectInfoCell = cells[i];
            break;
          }
        }
        if (selectInfoCell != null) {
          updateRow(request, selectInfoCell.rowNum);
        }
        else {
          appendRow(array);
        }
      }
      else if (headerType === "notebook_item") {
        var newValue = array[2];
        var cells = filterCells(headerType);
        cells = filterCells(array[0])
        var selectInfoCell = null;
        for (i = 0; i < cells.length; i++) {
          var hasCell = cells[i].row.includes(newValue);
          if (hasCell) {
            selectInfoCell = cells[i];
            break;
          }
        }
        if (selectInfoCell != null) {
          updateRow(request, selectInfoCell.rowNum);
          Logger.log("Update: " + selectInfoCell.code);
        }
        else {
          appendRow(array);
        }
      }
      else if (headerType === "lesson_item") {
        var newValue = array[2];
        var cells = filterCells(headerType);
        cells = filterCells(array[0])
        var selectInfoCell = null;
        for (i = 0; i < cells.length; i++) {
          var hasCell = cells[i].row.includes(newValue);
          if (hasCell) {
            selectInfoCell = cells[i];
            break;
          }
        }
        if (selectInfoCell != null) {
          updateRow(request, selectInfoCell.rowNum);
          Logger.log("Update: " + selectInfoCell.code);
        }
        else {
          appendRow(array);
        }
      }
      else if (headerType === "lesson") {
        var newValue = array[2];
        var cells = filterCells(headerType);
        cells = filterCells(array[0])
        var selectInfoCell = null;
        for (i = 0; i < cells.length; i++) {
          var hasCell = cells[i].row.includes(newValue);
          if (hasCell) {
            selectInfoCell = cells[i];
            break;
          }
        }
        if (selectInfoCell != null) {
          updateRow(request, selectInfoCell.rowNum);
          Logger.log("Update: " + selectInfoCell.code);
        }
        else {
          appendRow(array);
        }
      }
      else if (headerType === "notebook") {
        var newValue = array[2];
        var cells = filterCells(headerType);
        cells = filterCells(array[0])
        var selectInfoCell = null;
        for (i = 0; i < cells.length; i++) {
          var hasCell = cells[i].row.includes(newValue);
          if (hasCell) {
            selectInfoCell = cells[i];
            break;
          }
        }
        if (selectInfoCell != null) {
          updateRow(request, selectInfoCell.rowNum);
          Logger.log("Update: " + selectInfoCell.code);
        }
        else {
          appendRow(array);
        }
      }
    }
    else if (queryArray[0] === "GET") {
      var data = getData();
      var json = getAsJson(data);
      resultLogger.push(json);
    }
    else if (queryArray[0] === "POST") {
      // Get all Parameters
      var array = paramaterAsArray(request);
      // Append data on Google Sheet
      var rowData = activeSheet.appendRow([array[0], array[1], array[2], array[3], array[4], array[5], array[6], array[7]]);
    }
    else if (queryArray[0] === "UPDATE") {
      //updateRow(request, 814);
      //resultLogger.push("UPDATE");
    }
    else if (queryArray[0] === "REQUEST") {

      result = request;
    }
    else {
      var array = paramaterAsArray(request);
      appendRow(array);
    }
  } catch (exc) {
    // If error occurs, throw exception
    resultLogger.push("FAILED: " + exc.message);
  }

  // Return result
  return ContentService
    .createTextOutput(JSON.stringify(resultLogger))
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
function testCode() {
  //updateRowString(request, "97c5cada-3778-41a7-bd0f-b93a5bc5bfdd", "notebook_item", );
  var request = getSampleRequest();
  doPost(request);
}
//CUSTOMS

function getData() {
  var rows = activeSheet.getDataRange();
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
function updateRow(request, rowNum) {
  var array = paramaterAsArray(request);
  updateRowString(array, rowNum);


}
function updateRowString(array, rowNum) {
  for (i = 0; i < array.length; i++) {
    var cell = getCell(rowNum, i + 1);
    updateValue(cell, array[i]);
  }
}
function paramaterAsArray(request) {
  var unique_id = request.parameter.unique_id;//0
  var type = request.parameter.type;//1
  var book = request.parameter.book;//2
  var title = request.parameter.title;//3
  var message = request.parameter.message;//4
  var notes = request.parameter.notes;//5
  var link = request.parameter.link;//6
  var color = request.parameter.color;//7
  return [unique_id, type, book, title, message, notes, link, color]
}
function appendRow(array) {
  var rowData = activeSheet.appendRow([array[0], array[1], array[2], array[3], array[4], array[5], array[6], array[7]]);

}
function getSampleRequest() {
  var request = {
    contentLength: 120,
    parameters: {
      notes: [
        ""
      ],
      type: [
        "highlight"
      ],
      color: [
        "NEW COLOR"
      ],
      title: [
        ""
      ],
      link: [
        ""
      ],
      message: [
        ""
      ],
      unique_id: [
        ""
      ],
      book: [
        "Insert"
      ],
      UPDATEIF: [
        "UPDATEIF"
      ]
    },
    queryString: "UPDATEIF=UPDATEIF",
    parameter: {
      message: "",
      book: "Insert",
      color: "",
      UPDATEIF: "UPDATEIF",
      type: "highlight",
      link: "",
      unique_id: "",
      notes: "",
      title: ""
    },
    postData: {
      contents: "unique_id=f391d674-2b46-4e0d-8564-5519aaf1f4c1&type=notebook_item&book=1Thess+5%3A18&title=&message=&notes=&link=&color=",
      length: 120,
      name: "postData",
      type: "application/x-www-form-urlencoded"
    },
    contextPath: ""
  }
  return request;
}










//LIBRARIES
function getAsJson(dataArray) {
  var json = ContentService
    .createTextOutput(JSON.stringify(dataArray))
    .setMimeType(ContentService.MimeType.JSON);
  return json;
}
function updateSheet(rowNum, column, newValue) {
  var cell = getCell(rowNum, column);
  Logger.log("old-value: " + cell.getValue());
  //updateValue(cell, newValue);
  Logger.log("new-value: " + newValue);


}
//Always start with 1 not zero, HEADER is included
function getCell(rowNum, column) {
  if (rowNum == 0) {
    rowNum = 1;
  }
  // Example C2, C is the column horizontal alphabet (ABC), 2 is the row vertical number.
  var positionCode = getLetter(column) + "" + rowNum;
  Logger.log("HEADER: " + activeSheet.getRange(getLetter(column) + "" + 1).getValue());
  return activeSheet.getRange(positionCode);
}
//Update value in specific cell
function updateValue(cell, newValue) {
  cell.setValue(newValue);
}
//Find cells with HEADER that has value of.
function findCells(withHeader, withValueOf) {
  //withHeader = "book"; 
  //withValueOf = "John 1:1";
  var rows = getAllRows();
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
        var info = new CellInfo(cell, positionCode, r, rowCounter);
        results.push(info);

      }
      rowCounter++;
    });
  }

  return results;
}
//Filter the cells that has specific values.
function filterCells(hasValueOf) {
  var rows = getAllRows();
  var results = [];
  //Iterate vertical numbers or rows
  var rowCounter = 1;
  rows.forEach(r => {
    var columns = r;
    var index = 0;
    var info = new CellInfo();

    var cell = null;
    var positionCode = "";
    //Each row has columns, Iterate horizontal column.
    var hasValue = false;
    columns.forEach(c => {
      if (c == hasValueOf) {
        hasValue = true;
        var letter = getLetter(index + 1);
        positionCode = letter + "" + rowCounter;
        cell = activeSheet.getRange(positionCode)

        info.cell = cell;
        info.code = positionCode;
        info.row = r;
        info.rowNum = rowCounter;
      }
      index++;

    });
    if (hasValue) {
      results.push(info);
    }
    rowCounter++;
  });


  return results;
}
function deleteRow(row) {
  activeSheet.deleteRow(row);
}
function deleteEmptyRows() {
  var values = getAllRows();
  var rowNum = 1;
  values.forEach(r => {
    var val = "";
    for (i = 0; i < r.length; i++) {
      val += r[i];
    }
    if (val.trim() === "") {
      //Delete row action
      Logger.log("Deleted row: " + rowNum);
      deleteRow(rowNum);
    }
    rowNum++;
  });
}
function getAllRows(){
  var rows = activeSheet.getDataRange();
  var values = rows.getValues();
  return values;
}
function setHeaders(sheetName, columnNames) {
  var activeSheet = SpreadsheetApp.openById(sheetId);
  // check result of trying to get Sheet
  if (activeSheet === null) {
    // Sheet does not exist, so create it
    var getNewSheet = activeSheet.insertSheet(sheetName);
    // get total number of Columns in Sheet regardless of if empty
    var maxCols = getNewSheet.getMaxColumns();

    // delete unnecessary Columns (minus the number we want to keep)
    getNewSheet.deleteColumns(7, maxCols - 6);

    // get Header row range
    var headerRow = getNewSheet.getRange(1, 1, 1, 6);

    // add Header values
    headerRow.setValues([columnNames]);

    // set font size
    headerRow.setFontSize(14);

    // set font colour
    headerRow.setFontColor('white');

    // set font bold
    headerRow.setFontWeight('bold');

    // set font horizontal alignment
    headerRow.setHorizontalAlignment('center');

    // set font vertical alignment
    headerRow.setVerticalAlignment('middle');

    // set row background colour
    headerRow.setBackground('black');

    // set row height
    getNewSheet.setRowHeight(1, 34);

    // set column widths
    getNewSheet.setColumnWidths(1, 6, 208);
  }
  // else {
  //   // Sheet already exists so delete and create new one
  //   activeSheet.deleteSheet(getSheet);
  //   var getNewSheet = ss.insertSheet(sheetName);
  // }
}
function createNewSheet(newSheetName){
    var newSheet = activeSheet.insertSheet();
    newSheet.setName(newSheetName);
}

//HELPERS
class CellInfo {
  constructor(cell, code, row, rownum) {
    this.code;
    this.cell;
    this.row;
    this.rownum;

  }
}
function getLetter(column) {
  if (column > 0) {
    column = column - 1;
  }
  const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  return alphabet[column];
}

