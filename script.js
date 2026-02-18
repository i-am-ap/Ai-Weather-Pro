const API_URL = "/api/weather";

/* MAIN FETCH */

async function getWeather(city){

try{

if(!city) city=document.getElementById("cityInput").value;

let res = await fetch(`${API_URL}?city=${city}`);

if(!res.ok) throw new Error("API failed");

let data = await res.json();

showWeather(data);
forecast(data);
chart(data);
outfitAI(data);
alerts(data);
satellite(data.location.lat,data.location.lon);
sky3D(data.current.condition.text);

lightningEffect(data.current.condition.text);
setDynamicBackground(data.current.condition.text,data.current.is_day);
weatherEffects(data.current.condition.text,data.current.is_day);

}catch(err){
console.error(err);
alert("Weather failed to load. Check city name or API.");
}
}




/* WEATHER UI */

function showWeather(d){
document.getElementById("weather").innerHTML=`
<h2>${d.location.name}</h2>
<h1>${d.current.temp_c}°C</h1>
<p>${d.current.condition.text}</p>`;
}


/* FORECAST */

function forecast(d){
let html="";
d.forecast.forecastday.forEach(x=>{
html+=`
<div class="card">
<h4>${x.date}</h4>
<img src="${x.day.condition.icon}">
<p>${x.day.avgtemp_c}°C</p>
</div>`;
});
document.getElementById("forecast").innerHTML=html;
}


/* CHART */

let chartObj;

function chart(d){
let ctx=document.getElementById("chart").getContext("2d");

if(chartObj) chartObj.destroy();

chartObj=new Chart(ctx,{
type:"line",
data:{
labels:d.forecast.forecastday.map(x=>x.date),
datasets:[{
label:"Temp °C",
data:d.forecast.forecastday.map(x=>x.day.avgtemp_c),
tension:0.4
}]
}
});
}

function toggleChart(){
let c=document.getElementById("chart");
c.style.display=c.style.display==="none"?"block":"none";
}


/* LOCATION */

function getLocation(){
navigator.geolocation.getCurrentPosition(pos=>{
getWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
});
}


/* VOICE SEARCH */

function voiceSearch(){
let Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
if(!Speech){ alert("Voice search not supported"); return; }
let rec=new Speech();

rec.start();
rec.onresult=e=>{
let city=e.results[0][0].transcript;
document.getElementById("cityInput").value=city;
getWeather(city);
};
}


/* THEME */

function toggleTheme(){
document.body.classList.toggle("dark");
}


/* OUTFIT AI */

function outfitAI(d){
let t=d.current.temp_c;
let text="";

if(t<10) text="🧥 Heavy Jacket + Gloves";
else if(t<20) text="🧥 Light Jacket";
else if(t<30) text="👕 T-shirt";
else text="🩳 Shorts + Cap";

document.getElementById("outfit").innerHTML=text;
}


/* ALERTS */

function alerts(d){

let container=document.getElementById("alert");
let a=d.alerts?.alert || [];

if(!a.length){
container.innerHTML="";
return;
}

let text=a[0].headline.toLowerCase();
let type="info";
let icon="ℹ️";

if(text.includes("storm")||text.includes("cyclone")||text.includes("extreme")){
type="danger";
icon="⛔";
}
else if(text.includes("rain")||text.includes("wind")||text.includes("heat")){
type="warning";
icon="⚠️";
}

container.innerHTML=`
<div class="alertBox alert-${type}">
<span class="alertIcon">${icon}</span>
<span>${a[0].headline}</span>
</div>
`;
}


/* SATELLITE */

function satellite(lat,lon){
document.getElementById("satellite").src=
`https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=4&overlay=satellite`;
}


/* 3D SKY */


function sky3D(condition){

let container=document.getElementById("threeContainer");
container.innerHTML="";

/* scene */

let scene=new THREE.Scene();
let camera=new THREE.PerspectiveCamera(75,container.clientWidth/300,0.1,1000);
let renderer=new THREE.WebGLRenderer({alpha:true});
renderer.setSize(container.clientWidth,300);
container.appendChild(renderer.domElement);

camera.position.z=5;

/* TIME */

let hour=new Date().getHours();
let isNight = hour>=19 || hour<=5;

/* SUN OR MOON */

let celestialGeo=new THREE.SphereGeometry(1,32,32);

let celestialMat=new THREE.MeshBasicMaterial({
color:isNight?0xddddff:0xffdd44
});

let celestial=new THREE.Mesh(celestialGeo,celestialMat);
scene.add(celestial);

/* POSITION BASED ON TIME */

let angle=(hour/24)*Math.PI*2;
celestial.position.x=Math.cos(angle)*3;
celestial.position.y=Math.sin(angle)*1.5;

/* CLOUDS */

let clouds=[];
let cloudGeo=new THREE.SphereGeometry(.5,16,16);
let cloudMat=new THREE.MeshBasicMaterial({color:0xffffff});

for(let i=0;i<6;i++){
let c=new THREE.Mesh(cloudGeo,cloudMat);
c.position.set(Math.random()*6-3,Math.random()*2-1,0);
scene.add(c);
clouds.push(c);
}

/* STARS */

let stars=[];

if(isNight){

let starGeo=new THREE.SphereGeometry(.03,8,8);
let starMat=new THREE.MeshBasicMaterial({color:0xffffff});

for(let i=0;i<120;i++){
let s=new THREE.Mesh(starGeo,starMat);
s.position.set(Math.random()*10-5,Math.random()*6-3,-2);
scene.add(s);
stars.push(s);
}
}

/* MOON PHASE */

if(isNight){

let day=new Date().getDate();
let phase=(day%29)/29;

celestial.scale.x=1-phase;
}

/* ANIMATION */

function animate(){
requestAnimationFrame(animate);

/* rotate sun/moon slowly */
celestial.rotation.y+=0.002;

/* clouds drifting */
clouds.forEach(c=>{
c.position.x+=0.002;
if(c.position.x>3) c.position.x=-3;
});

renderer.render(scene,camera);
}
animate();
}



/* LIGHTNING EFFECT */

let lightningInterval;

function lightningEffect(condition){

let box=document.getElementById("lightning");

/* stop previous lightning */
clearInterval(lightningInterval);

if(condition.toLowerCase().includes("thunder") ||
   condition.toLowerCase().includes("storm")){

lightningInterval=setInterval(()=>{
box.classList.add("flash");

setTimeout(()=>{
box.classList.remove("flash");
},400);

}, Math.random()*4000+2000);

}
else{
box.classList.remove("flash");
}
}


/* DYNAMIC BACKGROUND */


// /* DEFAULT LOAD */

window.onload=()=>getWeather("Mumbai");


function setDynamicBackground(condition,isDay){

let c=condition.toLowerCase();

let sky=document.getElementById("sky-bg");
let stars=document.getElementById("stars");
let clouds=document.getElementById("clouds");

/* NIGHT */

if(!isDay){
sky.style.backgroundImage=
"url('https://images.unsplash.com/photo-1534081333815-ae5019106622?auto=format&fit=crop&w=1500&q=80')";
stars.style.opacity="1";
clouds.style.opacity="0.1";
return;
}

/* DAY WEATHER */

stars.style.opacity="0";

/* STORM */
if(c.includes("storm")||c.includes("thunder")){
sky.style.backgroundImage=
"url('https://images.unsplash.com/photo-1500674425229-f692875b0ab7?auto=format&fit=crop&w=1500&q=80')";
clouds.style.opacity=".7";
}

/* RAIN */
else if(c.includes("rain")||c.includes("drizzle")){
sky.style.backgroundImage=
"url('https://images.unsplash.com/photo-1501696461445-6f8f4f9a0c58?auto=format&fit=crop&w=1500&q=80')";
clouds.style.opacity=".6";
}

/* SNOW */
else if(c.includes("snow")){
sky.style.backgroundImage=
"url('https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=1500&q=80')";
clouds.style.opacity=".5";
}

/* CLOUDY */
else if(c.includes("cloud")){
sky.style.backgroundImage=
"url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1500&q=80')";
clouds.style.opacity=".6";
}

/* SUNNY */
else{
sky.style.backgroundImage=
"url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=80')";
clouds.style.opacity=".2";
}
}




let lightningTimer;

function weatherEffects(condition,isDay){

let c=condition.toLowerCase();

let rain=document.getElementById("rain");
let snow=document.getElementById("snow");
let fog=document.getElementById("fog");
let sunrise=document.getElementById("sunrise");
let lightning=document.getElementById("lightning");

/* reset */
rain.style.display="none";
snow.style.display="none";
fog.style.display="none";
sunrise.style.display="none";
clearInterval(lightningTimer);

/* sunrise */

let hour=new Date().getHours();
if(hour>=5 && hour<=7 && isDay)
sunrise.style.display="block";

/* rain */
if(c.includes("rain")||c.includes("drizzle"))
rain.style.display="block";

/* snow */
if(c.includes("snow"))
snow.style.display="block";

/* fog */
if(c.includes("fog")||c.includes("mist")||c.includes("haze"))
fog.style.display="block";

/* storm lightning */
if(c.includes("storm")||c.includes("thunder")){
lightningTimer=setInterval(()=>{
lightning.classList.add("flash");
setTimeout(()=>lightning.classList.remove("flash"),400);
},3000+Math.random()*4000);
}
}

