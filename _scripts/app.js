
//Wait for the document to load and for ugui.js to run before running your app's custom JS
$(document).ready( runApp );

//Container for your app's custom JS
function runApp() {

    ugui.helpers.loadSettings();

    var correctSlash = "/";
    if ( process.platform == "win32" ) {
        correctSlash = "\\";
    }

    function cleanURL () {
        var url = $("#url").val();
        url = url.replace("https://", "");
        url = url.replace("http://",  "");
        url = url.replace("www.",     "");
        url = url.split(".").join(" ");
        url = url.split("/").join(" ");
        url = url.split("?").join(" ");
        url = url.split("&").join(" ");
        url = url.split("|").join(" ");
        url = url.split("=").join(" ");
        url = url.split("*").join(" ");
        url = url.split("\\").join(" ");
        url = url.split('"').join(" ");
        url = url.split(":").join(" ");
        url = url.split("<").join(" ");
        url = url.split(">").join(" ");
        return url;
    }

    $("#url").change(function () {
        var url = cleanURL();
        $("#output").val(url);
    });
    $("#url").keyup(function () {
        var url = cleanURL();
        $("#output").val(url);
    });

    $("#run").click(function (event) {
        event.preventDefault();
        ugui.helpers.buildUGUIArgObject();

        var filetype = "html";
        var ext = ".html";
        if (ugui.args.outputcsv.htmlticked) {
            filetype = "csv";
            ext = ".csv";
        } else if (ugui.args.outputhtml.htmlticked) {
            filetype = "html";
            ext = ".html";
        } else if (ugui.args.outputjson.htmlticked) {
            filetype = "json";
            ext = ".json";
        } else if (ugui.args.outputmd.htmlticked) {
            filetype = "markdown";
            ext = ".md";
        }

        var standard = "WCAG2AA";
        if (ugui.args.standardsection.htmlticked) {
            standard = "Section508";
        } else if (ugui.args.standardwcaga.htmlticked) {
            standard = "WCAG2A";
        } else if (ugui.args.standardwcagaa.htmlticked) {
            standard = "WCAG2AA";
        } else if (ugui.args.standardwcagaaa.htmlticked) {
            standard = "WCAG2AAA";
        }

        var url = ugui.args.url.value;
        var folderPicker = ugui.args.folderPicker.value;
        var fileName = ugui.args.output.value;
        var exandargs = "pa11y -r " + filetype + " -s " + standard + " " + url;

        ugui.helpers.runcmd(exandargs, function (data) {
            ugui.helpers.writeToFile(folderPicker + correctSlash + fileName + ext, data);
        });

        var pa11y = require('pa11y');

        var test = pa11y({
            'allowedStandards': [standard],
            ignore: [ 'notice' ]
        });

        test.run(url, function (error, results) {
            $("#results").empty();
            var warn = 0;
            var noti = 0;
            var erro = 0;
            for (var i = 0; i < results.length; i++) {
                var theType = results[i].type;
                var panelColor = "default";
                if (theType == "warning") {
                    panelColor = "warning";
                    warn = warn + 1;
                } else if (theType == "error") {
                    panelColor = "danger";
                    erro = erro + 1;
                } else if (theType == "notice") {
                    panelColor = "primary";
                    noti = noti + 1;
                }

                var theContext = results[i].context;
                theContext = theContext.split("<").join("&lt;");

                var entry =
                  '<div class="panel panel-' + panelColor + '">' +
                    '<div class="panel-heading">' + results[i].code + '</div>' +
                    '<div class="panel-body">' +
                      '<strong class="text-capitalize">' + results[i].type + ':</strong> ' + results[i].message + '<br /><br />' +
                      '<pre><code>' + theContext + '</code></pre><br />' +
                    '</div>' +
                    '<div class="panel-footer text-sm"><h4><small>' + results[i].selector + '</small></h4></div>' +
                  '</div>';
                if (theType == "error") {
                    $("#results").prepend(entry);
                } else {
                    $("#results").append(entry);
                }
            }
            $("#button-row .btn-danger span").text(erro);
            $("#button-row .btn-warning span").text(warn);
            $("#button-row .btn-primary span").text(noti);
        });

    });


    var argsForm = [];
    argsForm.push( $("#pa11y *[data-argName]") );

    function unlockSubmit() {
        //If a required element wasn't filled out in this form
        if ( $("#pa11y").is(":invalid") ) {
            //Disable/Lock the submit button
            $("#pa11y .sendCmdArgs").prop("disabled", true);
            $("#pa11y .sendCmdArgs").addClass("").removeClass("btn-success");
        //If all required elements in a form have been fulfilled
        } else {
            //Enable/Unlock the submit button
            $("#pa11y .sendCmdArgs").prop("disabled", false);
            $("#pa11y .sendCmdArgs").addClass("btn-success").removeClass("btn-default");
        }
    }

    for (index = 0; index < argsForm.length; index++) {
        //When you click out of a form element
        $(argsForm[index]).keyup  ( unlockSubmit );
        $(argsForm[index]).mouseup( unlockSubmit );
        $(argsForm[index]).change ( unlockSubmit );
    }

    //On page load have this run once to unlock submit if nothing is required.
    unlockSubmit();


}// end runApp();