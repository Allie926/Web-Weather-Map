const app = new Vue({
	el: '#app',
	data: {
		elements: [] //holds the cloud stored data
	}
});

// Initialize Firebase
var config = {
	apiKey: "AIzaSyC5xdUUxRLPXRGUYHoYO3F8BHtWSh8gpmY",
	authDomain: "mapproject-b19dc.firebaseapp.com",
	databaseURL: "https://mapproject-b19dc.firebaseio.com",
	projectId: "mapproject-b19dc",
	storageBucket: "mapproject-b19dc.appspot.com",
	messagingSenderId: "1049472242488"
};
firebase.initializeApp(config);

//console.log(firebase); // make sure firebase is loaded

// get data from Firebase
firebase.database().ref("searches").on("value", dataChanged, firebaseError);
	
// callback function
function dataChanged(data){
	let obj = data.val();
	//console.log(obj);
	let bigString="";
	let index = 0;
	app.elements = [];
	for (let key in obj){   // use for..in to interate through object keys
		let row = obj[key];
		app.elements.push({"location":row.location,"weather":row.weather,"temperature":row.temperature,"tempType":row.tempType,"wind":row.wind,"windType":row.windType});
		//console.log(app.elements[index]);
	}
}
	
// throw an error if something goes wrong
function firebaseError(error){
	console.log(error);
}