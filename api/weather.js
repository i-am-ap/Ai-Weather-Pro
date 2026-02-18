export default async function handler(req, res){

const city = req.query.city || "Mumbai";

const response = await fetch(
`https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=${city}&days=7&aqi=yes&alerts=yes`
);

const data = await response.json();

res.status(200).json(data);
}
