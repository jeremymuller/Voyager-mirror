// https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
function loadJSON(callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'data/satellites.json', true);
    xhttp.overrideMimeType("application/json");
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            console.log("ready");
            callback(xhttp.responseText);
        }
    };
    xhttp.send(null);
}

function midiToFreq(note) {
	return 440 * Math.pow(2, ((note-69)/12.0));
}

function random(min, max) {
	if (typeof min === "object") {
		// this should be an array
        if (arguments.length < 2)
            return min[Math.floor(Math.random()*min.length)];
        else {
            var subset = [];
            for (var i = 0; i < max; i++) {
                var element = min[Math.floor(Math.random()*min.length)];
                subset.push(element);
            }
            return subset;
        }
	} else if (arguments.length < 2) {
		return Math.random() * min;
	} else {
	    var diff = max - min;
	    return ((Math.random() * diff) + min);
	}
}

function theEnd() {
    play = false;

    // display ending text
    var finale = document.createElement("div");
    text = document.createTextNode("The End");
    finale.appendChild(text);
    finale.className = "splash";
	wrapper = document.createElement("div");
	wrapper.className = "wrapper";
	wrapper.id = "container";
    wrapper.appendChild(finale);
    document.body.appendChild(wrapper);
	console.log("the end");
}
