////////////////////////////////////////////////////////////////////////
//                             Functions                              //
////////////////////////////////////////////////////////////////////////
function getDirName() {
    let name = document.currentScript.src;
    let server = location.protocol + "//" + document.location.host;
    name = name.slice(server.length, name.length);
    return name.substring(0, name.lastIndexOf("/")+1); 
}

function getFileName()   {
    let name = document.currentScript.src;
    return name.substring(name.lastIndexOf("/")+1, name.lastIndexOf("."));
}

function getNumberOfFiles(url, datDir) {
    let numDataFiles = 0;
    $.ajax({
        url: url,
        type: "POST",
        async: false,
        data:{"dir": datDir}
    }).done(function(data) {
        numDataFiles = data;
    });
    return numDataFiles;
}

function genVpNum() {
    "use strict";
    let num = new Date();
    num = num.getTime();
    jsPsych.data.addProperties({vpNum: num});
    return num;
}

function getVersionNumber(vpNumber, numberOfVersions) {
    if (vpNumber === 0) {
        vpNumber = 1;
    }
    return ((vpNumber - 1) % numberOfVersions) + 1;
}

function checkVpInfoForm() {
    // get age, gender, handedness and VPs consent
    "use strict";
    let age = document.getElementById("age").value;

    let gender = "";
    if ($("#male").is(":checked")) {
        gender = "male";
    } else if ($("#female").is(":checked")) {
        gender = "female";
    }

    let hand = "";
    if ($("#left").is(":checked")) {
        hand = "left";
    } else if ($("#right").is(":checked")) {
        hand = "right";
    }

    let consent = false;
    if ($("#consent_checkbox").is(":checked")) {
        consent = true;
    }

    if (consent && age !== "" && gender !== "" && hand !== "") {
        jsPsych.data.addProperties({age: age, gender: gender, handedness: hand});
        return true;
    } else {
        window.alert("Please answer all questions and click the consent box to continue!");
        return false;
    }

}

function codeTrial() {
    "use strict";
    let dat = jsPsych.data.get().last(1).values()[0];
    let corrCode = 0;
    let corrKeyNum = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(dat.corrResp);
    if (dat.key_press === corrKeyNum && dat.rt > prms.tooFast && dat.rt < prms.tooSlow) {
        corrCode = 1;  // correct
    } else if (dat.key_press !== corrKeyNum && dat.rt > prms.tooFast && dat.rt < prms.tooSlow) {
        corrCode = 2;  // choice error
    } else if (dat.rt === null) {
        corrCode = 3; // too slow
    } else if (dat.rt <= prms.tooFast) {
        corrCode = 4; // too false
    }
    jsPsych.data.addDataToLastTrial({date: Date(), corrCode: corrCode, blockNum: prms.cBlk, trialNum: prms.cTrl});
    prms.cTrl += 1;
    if (dat.key_press === 27) {
        jsPsych.endExperiment();
    }
}

function trialFeedbackTxt(feedback_text) {
    "use strict";
    let dat = jsPsych.data.get().last(1).values()[0];
    return "<H1>" + feedback_text[dat.corrCode - 1] + "</H1>";
}

function blockFeedbackTxt(filter_options) {
    "use strict";
    let dat = jsPsych.data.get().filter({...filter_options, blockNum: prms.cBlk});
    let nTotal = dat.count();
    let nError = dat.select("corrCode").values.filter(function (x) { return x !== 1; }).length;
    dat = jsPsych.data.get().filter({...filter_options, corrCode: 1});
    let blockFbTxt = "<H1>Block: " + prms.cBlk + " of " + prms.nBlks + "</H1>" +
        "<H1>Mean RT: " + Math.round(dat.select("rt").mean()) + " ms </H1>" +
        "<H1>Error Rate: " + Math.round((nError / nTotal) * 100) + " %</H1>" +
        "<H2>Press any key to continue the experiment!</H2>";
    prms.cBlk += 1;
    return blockFbTxt;
}

function saveData(url, filename, rows = {}, 
                  colsToIgnore = ['stimulus', 'trial_type', 'internal_node_id', 'trial_index', 'time_elapsed']){

    let dat = jsPsych.data.get().filter(rows).ignore(colsToIgnore).csv();
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url); 
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({filename: filename, filedata: dat}));
}

function generateRandomString(length) {
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomString = "";
    for (let i = length; i > 0; --i)
        randomString += chars[Math.round(Math.random()*(chars.length - 1))];
    return randomString;
}

function saveRandomCode(url, fname, code){
    $.ajax({
        type:"post",
        cache: false,
        url: url, 
        data: {filename: fname, filedata: code}
    });
}

function recordScreenSize() {
    jsPsych.data.addProperties({
        screenHeight: screen.height,
        screenWidth: screen.width,
        aspectRatio: screen.width / screen.height
    });
}

function loadImages(imagefiles) {

    loadcount = 0;
    loadtotal = imagefiles.length;
    preloaded = false;
 
    // Load the images
    let loadedimages = [];
    for (let i = 0; i < imagefiles.length; i++) {
        var image = new Image();
        image.onload = function () {
            loadcount++;
            if (loadcount == loadtotal) {
                preloaded = true;
            }
        };
 
        // set the source and save 
        image.src = imagefiles[i];
        loadedimages[i] = image;

    }
 
    return loadedimages;
}

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// Returns a random int number between min (inclusive) and max (exclusive)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


////////////////////////////////////////////////////////////////////////
//                          Common Variables                          //
////////////////////////////////////////////////////////////////////////
const welcome_en = {
    type: "html-keyboard-response",
    stimulus: "<H1>Welcome. Press any key to continue.</H1>",
    response_ends_trial: true,
    on_finish: function () {
        "use strict";
        jsPsych.data.addProperties({date: Date()});
    }
};

const welcome_de = {
    type: "html-keyboard-response",
    stimulus: "<h1>Willkommen. Drücken Sie eine beliebige Taste, um fortzufahren!</h1>",
    on_finish: function(){
        "use strict";
        jsPsych.data.addProperties({date: Date()});
    }
};

const resize_de = {
    type: 'resize',
    item_width: 3 + 3/8,
    item_height: 2 + 1/8,
    prompt: "<p>Klicken Sie und ziehen Sie die untere rechte Ecke bis der Kasten die gleiche Größe wie eine Bankkarte oder Ihr Universitätsausweis hat.</p>",
    pixels_per_unit: 1000
};

const screenInfo = {
    type: "call-function",
    func: recordScreenSize,
    timing_post_trial: 50
};

const vpInfoForm = {
    type: "external-html",
    url: "/Common/vpInfoForm.html",
    cont_btn: "start",
    check_fn: checkVpInfoForm
};

const debrief_en = {
    type: 'html-keyboard-response',
    stimulus: "<H1>The experiment is finished.</H1>" + "<H2>Press any key to end the experiment!</H2>",
    response_ends_trial: true
};

const debrief_de = {
    type: "html-keyboard-response",
    stimulus: "<h1>Das Experiment ist beendet.</h1>" +
    "<h2>Drücken Sie eine beliebige Taste, um das Experiment zu beenden!</h2>",
    response_ends_trial: true
};



