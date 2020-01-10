let search; //stores the result of a search
let searched = false; //holds if the user has searched before, this is to prevent initializing Firebase more than once

//create the Vue object
const app = new Vue({
	el: '#app',
	data: {
		error: false,
		key: "APPID=2ceb8bb81968f59ab2df713630ae5180", //API key
		location: "", //the location searched for
		temperatureType: "kelvin", //the temperature units (K,C,F)
		temperature: 0, //the temperature value
		windType:"m/s", //the wind speed units (m/s,km/hr,mi/hr)
		wind: 0, //the wind speed value
		//the result of the search
		result: {"coord":{"lon":0,"lat":0},"weather":[{"id":0,"main":"","description":"","icon":""}],"base":"","main":{"temp":0,"pressure":0,"humidity":0,"temp_min":0,"temp_max":0},"visibility":0,"wind":{"speed":0,"deg":0},"clouds":{"all":0},"dt":0,"sys":{"type":0,"id":0,"message":0,"country":"","sunrise":0,"sunset":0},"id":0,"name":"","cod":0}
	},
	//get the last searched location when the page opens
	created(){
		if(typeof(window.localStorage) != undefined){
			this.location = window.localStorage.getItem("location");
		}
		else
			throw "window.localStorage, not defined";
	},
	methods:{
		//search for the location in the search box
		search(){
			this.error = false;
			
			//set the local storage for the value in the search box
			if(typeof(window.localStorage) != undefined){
				window.localStorage.setItem("location", this.location);
			}
			else
				throw "window.localStorage, not defined";
			
			//fetch the API using the input location and the API key
			fetch("https://api.openweathermap.org/data/2.5/weather?q=" + this.location + "&" + this.key)
			.then(response => {
				//if the input doesn't exist, print to console and inform the user
				if(!response.ok){
					//console.log("Location doesn't exist");
					this.location = "location not valid";
					this.error = true;
				}
				return response.json();
			})
			.then(json => {	
				//console.log(json);
				//console.log(this.error);
				if(!this.error)
				{
					//set the result
					this.result=json;
					
					//move to the location searched for
					moveTo(this.result.coord.lat,this.result.coord.lon);
					
					//check for temperature user input units and convert if necessary
					if(this.temperatureType == "celsius") //celcius
						this.temperature = this.result.main.temp - 273.15;
					else if(this.temperatureType == "fahrenheit") //fahrenheit
						this.temperature = (this.result.main.temp - 273.15) * 9.0/5.0 + 32;
					else //kelvin
						this.temperature = this.result.main.temp;
						
					//check for wind speed user input units and convert if necessary
					if(this.windType == "km/hr") //killometers/hour
						this.wind = this.result.wind.speed * 3.6;
					else if(this.windType == "mi/hr") //miles/hour
						this.wind = this.result.wind.speed * 2.237;
					else //meters/second
						this.wind = this.result.wind.speed;
						
					//set the search object for Firebase
					search = new Data(this.location,this.result.weather[0].description,this.temperature,this.temperatureType,this.wind,this.windType);
					
					// Initialize Firebase, only if the user hasn't searched already
					if(!searched)
					{
						searched=true;
						var config = {
							apiKey: "AIzaSyC5xdUUxRLPXRGUYHoYO3F8BHtWSh8gpmY",
							authDomain: "mapproject-b19dc.firebaseapp.com",
							databaseURL: "https://mapproject-b19dc.firebaseio.com",
							projectId: "mapproject-b19dc",
							storageBucket: "mapproject-b19dc.appspot.com",
							messagingSenderId: "1049472242488"
						};
						firebase.initializeApp(config);
							  
						//console.log(firebase); // verify that firebase is loaded by logging the global it created for us
					}
					// get a reference to the databse
					let database = firebase.database();
						  
					// refer to a root node named 'searches'
					let ref = database.ref('searches');
						 
					// create search data
					let data = {
						location: search.location,
						weather: search.weather,
						wind: search.wind,
						temperature: search.temperature,
						tempType: search.tempType,
						windType: search.windType
					};
						  
					// send data to the 'searches' node
					ref.push(data);
				}
			})
	   } // end search
	} // end methods
});

//declare and initialize the Google map
let map;
function initMap() {
	let mapOptions={
		center:{lat:43.0846,lng:-77.6743},
		zoom:16,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	
	map = new google.maps.Map(document.getElementById('map'),mapOptions);
	map.mapTypeID = 'satellite';
	map.setTilt(45);
}
	
//move the camera to the specified latitude and longitude
function moveTo(latitude,longitude){
	map.setZoom(16);
	let position = {lat:latitude,lng:longitude};
	map.panTo(position);
}