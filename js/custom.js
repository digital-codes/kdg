// custom js, a. kugel
"use strict";

// a couple of global variables
var cookie = "";
var shareloc = {"status":"null"}; // don't use "location" as variable name!
var regmail = "";
var regcode = "";

// tab handling
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";

  // clear qr variables
  document.getElementById("qrdata").innerHTML = "Bitte scanne den QR-Code für die Anmledung";
  regcode = "";
  regmail = "";


  // update reg id
  if (tabName == "registerTab") {
    if (cookie != "") {
      w3.addClass("#regDue", "w3-hide")
      w3.removeClass("#regDone", "w3-hide")
      w3.addClass("#intro", "w3-hide")
    } else {
      w3.addClass("#regDone", "w3-hide")
      w3.removeClass("#intro", "w3-hide")
      w3.removeClass("#regDue", "w3-hide")
      w3.removeClass("#qrvideo", "w3-hide")
      // normally, we would do this first, but then we can
      // never check if it works ...
      getId();
      getQR();
    }
  }

  // tab actions
  if (tabName == "shareTab") {
    locateOnly() // start location
    share()
  } else {
    {
      // close video
      const video = document.getElementById('monitor');
      let stream = video.srcObject;
      if (stream) {
        let tracks = stream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        video.srcObject = null;
      }
    } {
      // close qrvideo
      const video = document.getElementById('qrvideo');
      let stream = video.srcObject;
      if (stream) {
        let tracks = stream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        video.srcObject = null;
      }
    }
  }

  if (tabName == "viewTab") {
    locate()
  }

  if (tabName == "statusTab") {
    var char = makeChart()
  }
}

// cookie handling
function getId() {
  if (cookie && (cookie != "")) return cookie;
  if (typeof(Storage) !== "undefined") {
    let ck = localStorage.getItem("cookie");
    if (!ck || (ck == "")) {
      ck = new Date();
      let nonce = "mckoqfnf" // just some data
      ck = CryptoJS.SHA256(ck + nonce);
      localStorage.setItem("cookie", ck);
    }
    cookie = ck;
    // remove item: localStorage.removeItem("key");
    // Code for localStorage/sessionStorage.
  } else {
    cookie = "No Storage";
  }
  document.getElementById("regId").innerHTML = cookie;
  return cookie;
}

function clearId() {
  cookie = "";
  if (typeof(Storage) !== "undefined") {
    localStorage.removeItem("cookie");
  }
}

// --------------- color switch -------------------
function toggleColor() {
  w3.toggleClass("body", "darklight", "brightlight")
}

// ---------------- geolocation ----------------------
function locateOnly() {
  const status = document.querySelector('#mapStatus');
  // clear

  function success(position) {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;

    status.textContent = "lat, long: " + lat + "," + long;
    // update global Geolocation
    shareloc = {"status":"ok","lat":lat,"long":long};
    console.log("location OK")

  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
    shareloc = {"status":"fail"};
    console.log("location failed")
  }

  if (!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
    shareloc = {"status":"null"};
  } else {
    status.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

// ---------------- leaflet ----------------------
// get location from geoloc code above
function locate() {
  const status = document.querySelector('#mapStatus');
  // clear

  function success(position) {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;

    status.textContent = "lat, long: " + lat + "," + long;
    // update global Geolocation
    shareloc = {"lat":lat,"long":long};


    var mymap = L.map('mapId').setView([lat, long], 13);
    var marker = L.marker([lat, long]).addTo(mymap);
    marker.bindPopup("<b>This is your position</b>").openPopup();
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(mymap);
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
  }

  if (!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
  } else {
    status.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

// -------------- image capture ----------------
//window.onload = async () => {
async function share() {
  const video = document.getElementById('monitor');
  const canvas = document.getElementById('photo');
  const shutter = document.getElementById('shutter');

  try {
    video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: true
    });

    await new Promise((resolve) => video.onloadedmetadata = resolve);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    shutter.onclick = () => canvas.getContext('2d').drawImage(video, 0, 0);
  } catch (err) {
    console.error(err);
  }
};

// ---------- vibration -----------
// duration is in ms, can be a list for pattern
function startVibrate(duration) {
  console.log("Vibrate")
  navigator.vibrate(duration);
}

// ---------- chart ----------------
function makeChart() {
  var char = c3.generate({
    bindto: '#chart',
    data: {
      x: 'x',
      //        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
      columns: [
        ['x', '2019-01-01', '2019-01-02', '2019-01-03', '2019-01-04', '2019-01-05', '2019-01-06'],
        ['Gesamt', 30, 200, 100, 400, 150, 250],
        ['Mittel', 50, 20, 10, 40, 15, 25],
        ['Selbst', 55, 25, 15, 45, 10, 20]
      ]
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%Y-%m-%d'
        }
      },
      y: {
        label: { // ADD
          text: 'Beiträge',
          position: 'outer-middle'
        }
      }
    }
  });
}

// ---------- QR code ----------------
function getQR() {
  //var video = document.getcreateElement("video");
  var video = document.getElementById("qrvideo");
  var canvasElement = document.getElementById("qrcanvas");
  var canvas = canvasElement.getContext("2d");
  var outputData = document.getElementById("qrdata");

  // Use facingMode: environment to attemt to get the front camera on phones
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "environment"
    }
  }).then(function(stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
  });

  function tick() {
    var codeFound = false
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        outputData.innerText = code.data;
        regcode = code.data; // set global variable
        codeFound = true
      }
    }
    if (!codeFound)
      requestAnimationFrame(tick);
    else {
      startVibrate(200);
      // close qrvideo
      const video = document.getElementById('qrvideo');
      let stream = video.srcObject;
      if (stream) {
        let tracks = stream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        video.srcObject = null;
      }
      w3.addClass("#qrvideo", "w3-hide")
    }
  }
}

// --------- submit registration ------------
function registration() {
  // need the following: email, qrcode
  regmail = document.getElementById('email').value
  if ((regmail != "") && (regcode != "")) {
    alert("Registration data: " + regmail + ", " + regcode)
  } else {
    alert("Mail oder QRCode fehlen noch!")
  }
}

// ------- upload data set ---------------
function upload(id) {
  let d = new Date();
  let msg = "Upload from " + id + "Date: " + d;
  if (shareloc.status == "ok")
    msg += "lat " + shareloc.lat + ", long " + shareloc.long
  alert(msg)
}

// --------- drag and drop ---------------
/*
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data));
}
*/

// device orientation
// ----------- orientation --------------
/*
if (window.DeviceOrientationEvent) {
	let orient = document.getElementById("orientation");
	orient.innerHTML = "<code>" + "Orientation API present" + "</code>";
    window.addEventListener("deviceorientation", function(event) {
        // alpha: rotation around z-axis
        var rotateDegrees = event.alpha;
        // gamma: left to right
        var leftToRight = event.gamma;
        // beta: front back motion
        var frontToBack = event.beta;

        handleOrientationEvent(frontToBack, leftToRight, rotateDegrees);
    }, true);
} else {
	let orient = document.getElementById("orientation");
	orient.innerHTML = "<code>" + "No orientation API" + "</code>";
}

var handleOrientationEvent = function(frontToBack, leftToRight, rotateDegrees) {
	let orient = document.getElementById("orientation");
	orient.innerHTML = "<code>" + frontToBack + ", " + leftToRight + ", " + rotateDegrees + "</code>";
    // do something amazing
};
*/
