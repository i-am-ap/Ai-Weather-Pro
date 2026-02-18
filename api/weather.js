export default async function handler(req, res) {
  const city = req.query.city;
  const key = process.env.API_KEY;

  const response = await fetch(
    `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${city}&days=7&aqi=yes`
  );

  const data = await response.json();
  res.status(200).json(data);
}
