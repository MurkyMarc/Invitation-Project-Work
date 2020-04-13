/* jshint esversion: 6 */

//var twiml_url = "http://206.81.9.223:80/api/twilio";
var twiml_url = "/api/twilio";

function sendTwiml() {
  // url encoded for ajax
  var textdata = $('#send-twiml').serialize();

  var ajaxGET = {
    type: "GET",
    contentType: 'application/json; charset=utf-8'
  };

  //  NOTES FOR SETTING ID AS PHONE NUMBER AND TESTING FOR DUPES
  //  for testing
  // var jdata = $("#send-twiml").serializeArray();
  //
  // if(Number(jdata[2].value) > 1000000000) {
  //        test to see if it exists in the database based on id
  //       console.log("on track");
  //
  //       $.ajax({url: home_dir, type: 'GET', data: textdata});
  //
  //        if no then add phonenumber
  //
  //       if yes alert
  // } else {
  //       console.log("broken");
  // }

  $.ajax({url: twiml_url, type: 'POST', data: textdata});
  $.ajax({url: '/send?reason=sendcontact', type: 'POST', data: textdata});
  $('#send-twiml')[0].reset();
  $('#custom-msg-box').val('');
  $("#example-table").tabulator("setData", "/send?reason=getcontacts", {}, ajaxGET);
};

function deleteme(id) {

  var ajaxGET = {
    type: "GET",
    contentType: 'application/json; charset=utf-8'
  };

  $.ajax({
    url: "/send?reason=deletecontact&_id=" + id,
    type: 'DELETE',
    success: function(result) {
      //console.log("deleted");
    }
  });
  $("#example-table").tabulator("setData", "/send?reason=getcontacts", {}, ajaxGET);
}

$(document).ready(function() {

  $('#review-inv-a').click(function() {
    $('#custom-msg-box').val("Hi " + document.getElementById("first-name").value + "! Thank you for choosing All Star Bail Bonds. Please take 30 seconds to leave a review with the link above or below. If you have any questions please call the office at 407-423-7827.\n\nhttp://magicallstarreviews.com/as");
  });

  $('#review-inv-m').click(function() {
    $('#custom-msg-box').val("Hi " + document.getElementById("first-name").value + "! Thank you for choosing Magic Bail Bonds. Please take 30 seconds to leave a review with the link above or below. If you have any questions please call the office at 407-322-0000.\n\nhttp://magicallstarreviews.com/ma");
  });

  $('#review-inv-s').click(function() {
    $('#custom-msg-box').val("Hi " + document.getElementById("first-name").value + "! Thank you for choosing Sanford Bail Bonds. Please take 30 seconds to leave a review with the link above or below. If you have any questions please call the office at 407-322-0000.\n\nhttp://magicallstarreviews.com/sa");
  });

  $('#review-followup').click(function() {
    $('#custom-msg-box').val("Hi " + document.getElementById("first-name").value + "! Just wanted to remind you to leave us a review on Google or Facebook using the link above when you get a sec. It would really help us out. Thanks again!");
  });

  var updateIcon = function(cell, formatterParams) {
    return "<span class='upd'>&#8634;</span>";
  };

  var formatDate = function(cell, formatterParams) {
    var date = new Date(cell.getValue());
    var new_date = moment(date).format("MM-DD-YYYY");
    return new_date;
  };

  $("#example-table").tabulator({

    initialSort: [
      {
        column: "d",
        dir: "desc"
      }
    ],

    layout: "fitDataFill",
    pagination: "local",
    paginationSize: 7,

    columns: [
      {
        title: "Name",
        field: "n",
        sorter: "string",
        editor: "input",
        headerFilter: "input",
        headerFilterPlaceholder: " "
      }, {
        title: "Phone",
        field: "p",
        align: "center",
        sorter: "string",
        editor: "input",
        headerFilter: "input",
        headerFilterPlaceholder: " "
      }, {
        title: "Email",
        field: "e",
        sorter: "alphanum",
        editor: "input",
        headerFilter: "input",
        headerFilterPlaceholder: " "
      }, {
        title: "Location",
        field: "l",
        align: "center",
        editor: "select",
        editorParams: {
          "Allstar": "Allstar",
          "Magic": "Magic",
          "Sanford": "Sanford"
        },
        headerFilter: true,
        headerFilterParams: {
          "allstar": "Allstar",
          "magic": "Magic",
          "sanford": "Sanford",
          "": "All"
        }
      }, {
        title: "Date",
        field: "d",
        align: "center",
        formatter: formatDate,
        cellClick: function(e, cell) {
          //console.log(cell.getData());
        },
        headerFilter: "input",
        headerFilterPlaceholder: " "
      }/*,
                  {
                        title: "Note",
                        field: "note",
                        sorter: "alphanum",
                        editor: "input",
                        headerFilter: "input",
                        headerFilterPlaceholder: "search"
                  },
                  {
                        title: "Save",
                        field: "_id",
                        align: "center",
                        formatter: updateIcon,
                        cellClick: function(e, cell) {
                              var d = cell.getRow().getData();
                              $.ajax({
                                    url: home_dir + "/" + cell.getValue(),
                                    type: 'PUT',
                                    data: d,
                                    success: function(result) {
                                          console.log("update worked");
                                    }
                              });
                              $("#example-table").tabulator("setData", home_dir, {}, ajaxGET);
                        }
                  }, {
                        title: "Delete",
                        field: "_id",
                        align: "center",
                        formatter: "buttonCross",
                        cellClick: function(e, cell) {
                              $.ajax({
                                    url: home_dir + "/" + cell.getValue(),
                                    type: 'DELETE',
                                    success: function(result) {
                                          console.log("it worked");
                                    }
                              });
                              cell.getRow().delete();
                        }
                  }*/
    ],
    rowFormatter: function(row, data) {
      var element = row.getElement(),
        data = row.getData(),
        width = element.outerWidth(),
        table;

      //clear current row data
      element.empty();

      //define a table layout structure and set width of row
      table = $("<table style='width:" + (
      width - 18) + "px;'><tr></tr></table>");

      //add row data on right hand side
      $("tr", table).append("<td><div><div class='name'><strong>" + data.n + "</strong></div><div class='date'>" + moment(data.d).format("MM-DD-YYYY") + "</div></div><div class='left-data'><div> Email: " + data.e + "</div><div>Phone: " + data.p + "</div><div><div class='loc'>Location: " + data.l + "</div><div class='click'>" + `<div class='tt'><i class='fa fa-times-circle' aria-hidden='true' onclick='deleteme("` + data._id + `")' ><span class='tttext'>Delete</span></i></div></div></div></div></td>`);

      //append newly formatted contents to the row
      element.append(table);
    }
  });

  var ajaxGET = {
    type: "GET",
    contentType: 'application/json; charset=utf-8'
  };

  //Auto load data into the table
  $("#example-table").tabulator("setData", '/send?reason=getcontacts', {}, ajaxGET);

  //Refresh Button
  $("#ajax-trigger").click(function() {
    $("#example-table").tabulator("setData", '/send?reason=getcontacts', {}, ajaxGET);
  });

  //trigger download of data.csv file
  $("#download-csv").click(function() {
    $("#example-table").tabulator("download", "json", "data.json");
  });

});
