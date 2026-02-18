import 'dotenv/config';

export default async function handler(req, res){

try{

const city = req.query.city || "Mumbai";

const r = await fetch(
`https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=${city}&days=7&aqi=yes&alerts=yes`
);

if(!r.ok){
return res.status(500).json({error:"Weather API failed"});
}

const data = await r.json();

res.status(200).json(data);

}catch(err){
res.status(500).json({error:err.message});
}

}
