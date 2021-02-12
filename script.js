
var myShakeEvent = new Shake({
    threshold: 15, // shake strength threshold
    timeout: 1000 // determines the frequency of event generation
});

// Start listening to device motion
myShakeEvent.start(); 

// Register a shake event listener on window with callback
window.addEventListener('shake', triggerSOS, false); 

//function to call when shake occurs
function triggerSOS () {
    const mailID=localStorage.getItem("emergency_email");
    var yourMessage = "I think I'm in trouble. My current location is: "+formatted_locn+". Please help me. Your email was submitted as safety mail by " + localStorage.getItem("username");
    var subject = "I need help";
    var mail="mailto:"+mailID+"?subject="+subject+"&body="+yourMessage;
    window = window.open(mail, 'emailWindow')
}

let latitude=0;
let longitude=0;

//Getting current longitude and latitude of user
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(storePosition);
  } else { 
    console.log("Geolocation is not supported by this browser.");
  }
}

//Update longitude and latitude of user
function storePosition(position) {
  latitude= position.coords.latitude;
  longitude= position.coords.longitude;
  console.log(latitude);
  console.log(longitude);
}

//Call function to get location
getLocation();

//To handle details of emergency contacts
function submitEmerForm(){
    localStorage.setItem("username", getElementById("InputName"));
    if(getElementById("InputEmail")!=undefined){
        localStorage.setItem("emergency_email", getElementById("InputEmail"));
    }
    if(getElementById("InputPhone")!=undefined){
        localStorage.setItem("emergency_phone", getElementById("InputPhone"));
    }
    console.log(localStorage.getItem("emergency_email"));
    console.log(localStorage.getItem("emergency_phone"));
}

document.getElementById("submitEmergForm").addEventListener("click", submitEmerForm());

//OPEN CAGE API -- to convert longitude and latitude to formatted address
const open_cage_apikey = 'a4f3a27c2d8b4909ac931ca4dfa5c2eb';

var api_url = 'https://api.opencagedata.com/geocode/v1/json'

var request_url = api_url
+ '?'
+ 'key=' + open_cage_apikey
+ '&q=' + encodeURIComponent(latitude + ',' + longitude)
+ '&pretty=1'
+ '&no_annotations=1';

var request = new XMLHttpRequest();
request.open('GET', request_url, true);

request.onload = function() {

if (request.status === 200){ 
    // Success
    var data = JSON.parse(request.responseText);
    formatted_locn=(data.results[0].formatted); // print the location
    console.log(formatted_locn);
    console.log(data);

} else if (request.status <= 500){                     
    console.log("unable to geocode! Response code: " + request.status);
    var data = JSON.parse(request.responseText);
    console.log('error msg: ' + data.status.message);
} else {
    console.log("server error");
}
};

request.onerror = function() {
console.log("unable to connect to server");        
};

request.send(); 

//Get nearby places using google places API

//const google_map_apiKey="AIzaSyA8usj5drF6yzWj2RTZKA3v6dYXo-Y98s4";
const google_map_apiKey="AIzaSyCYoXYOQAcYfCEHnAAetDKVpVhYViCiv6E";


//A general function to get places as requested by search query
function getPlaces(type_ip){
    let req_url_place="https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+latitude+","+longitude+"&radius=1500&type="+type_ip+"&keyword=police&station="+google_map_apiKey;

    var request_place = new XMLHttpRequest();
    request_place.open('GET', req_url_place, true);

    request_place.onload = function() {
        console.log(data);
    if (request_place.status === 200){ 
    // Success
    var data = JSON.parse(request_place.responseText);
    console.log(data);

    } else if (request_place.status <= 500){                     
    console.log("unable to geoplace! Response code: " + request_place.status);
    var data = JSON.parse(request_place.responseText);
    console.log('error msg: ' + data.status.message);
    } else {
    console.log("server error");
    }
    };

    request_place.onerror = function() {
    // There was a connection error of some sort
    console.log("unable to connect to server");        
    };

    request_place.send(); 
}


//Handling specific request
function getPoliceStations(){
    console.log("Getting Police Stations");
    getPlaces("police");
}
function getHospitals(){
    console.log("Getting Hospitals");
    getPlaces("hospital");
}
function getBusStations(){
    console.log("Getting Bus Stations");
    getPlaces("bus_station");
}

//Loading vicinity map using Google Maps Javascipt API
let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: latitude, lng: longitude },
    zoom: 20,
  });
}

initMap();

function getVicinity(){
    console.log("Getting Vicinity");
    initMap();
}

//To start recording the incident on request -> Future scalability update to store in database
function startRecording(){    
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    const audioChunks = [];
    mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
    });

    setTimeout(() => {
        mediaRecorder.stop();
    }, 300000);
    });
}