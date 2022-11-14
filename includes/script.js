var startButton, text, wrapper, clock;

var clock;
var sec = 0;
var min = 0;
var globalSeconds = 0; // in seconds
var trigger = false;
var paused = false;
var currentMvmt = '-1';
var noSleep = new NoSleep();

function buttonAction() {
    // wrapper.remove();
    wrapper.style.display = "none";
    document.getElementById("timer").style.display = "inline";
    document.getElementById("resetButton").style.display = "inline";
    clockFunction();
}

function clockFunction() {
    // start clock
    clock = setInterval(function () {
        if (min < 10) {
            if (sec < 10)
                document.getElementById("timer").innerHTML = "0" + min + ":0" + sec;
            else
                document.getElementById("timer").innerHTML = "0" + min + ":" + sec;
        } else {
            if (sec < 10)
                document.getElementById("timer").innerHTML = min + ":0" + sec;
            else
                document.getElementById("timer").innerHTML = min + ":" + sec;
        }

        // musical form stuff
        switch (globalSeconds) {
            case 1:
                publishIt('i');
                break;
            case 90:
                publishIt('1');
                break;
            case 240:
                !trigger ? publishIt('2') : pause('2');
                break;
            case 390:
                !trigger ? publishIt('3') : pause('3');
                break;
            case 510:
                !trigger ? publishIt('4') : pause('4');
                break;
            case 690:
                publishIt('c');
                break;
            case 750: // end
                clearInterval(clock);
                break;
        }

        globalSeconds++;
        sec++;
        if (sec > 59) {
            min++;
            sec = 0;
        }
    }, 1000);
}

function pause(mvmt) {
    clearInterval(clock);
    paused = true;
    currentMvmt = mvmt;
}

function init() {
    // create button
    startButton = document.createElement("button");
    startButton.onclick = buttonAction;
    text = document.createTextNode("Start");
    startButton.appendChild(text);
    startButton.className = "splash";
    startButton.id = "startButton";
    wrapper = document.createElement("div");
    wrapper.className = "wrapper";
    // wrapper.id = "container";
    wrapper.appendChild(startButton);
    document.body.appendChild(wrapper);
    document.getElementById("triggerMvmts").checked = false;
}

function reset() {
    clearInterval(clock);
    document.getElementById("resetButton").style.display = "none";
    wrapper.style.display = "inline";
    document.getElementById("timer").innerHTML = "00:00";
    sec = 0;
    min = 0;
    globalSeconds = 0;
    publishIt('-1');
}

function handleKey(event) {
    console.log("space bar!");
    if (paused) {
        var x = event.which || event.keyCode;
        if (x == 32) {
            // TODO: trigger movements
            console.log("trigger time!");
            globalSeconds++;
            sec++;
            clockFunction();
            paused = false;
            publishIt(currentMvmt);
        }
    }
}

function toggleTrigger() {
    trigger = document.getElementById("triggerMvmts").checked;
}

function publishIt(mvmt) {
    pubnub.publish({
        message: {
            // "mvmt": '3'
            "mvmt": mvmt
        },
        channel: 'JeremyMuller_Voyager',
        storeInHistory: false
    }, function (status, response) {
        if (status.error) {
            // handle error
            console.log(status);
        } else {
            console.log("message Published w/ timetoken", response.timetoken);
        }
    });
}

window.addEventListener("load", init);