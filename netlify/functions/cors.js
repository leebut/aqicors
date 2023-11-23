// This file was from a YouTube tutorial here
// https://www.youtube.com/watch?v=3j5cQy1V2W0

var fetch = require("node-fetch");

exports.handler = async (event, context) => {
  var url = event.path;
  url = url.split(".netlify/functions/cors/")[1];
  url = decodeURIComponent(url);
  url = new URL(url);

  for (let i in event.queryStringParameters) {
    url.searchParams.append(i, event.queryStringParameters[i]);
  }
  console.log(url.href);
  var cookie_string = event.headers.cookie || "";
  var useragent = event.headers["user-agent"] || "";
  
  // I had problems using the env variable for the Authorization header.
  // Reverted to pasting the full API key below
  const aqiToken = process.env.VITE_AQI_TOKEN;

  var header_to_send = {
    Authorization:
      "yourkeyhere",
    Cookie: cookie_string,
    "User-Agent": useragent,
    "content-type": "application/json",
    accept: "*/*",
    host: url.host,
  };

  var options = {
    method: event.httpMethod.toUpperCase(),
    headers: header_to_send,
    body: event.body,
  };

  if (
    event.httpMethod.toUpperCase() == "GET" ||
    event.httpMethod.toUpperCase() == "HEAD"
  )
    delete options.body;

  var response = await fetch(url, options);
  var response_text = await response.text();
  var headers = response.headers.raw();

  var cookie_header = null;
  if (headers["set-cookie"]) cookie_header = headers["set-cookie"];

  return {
    statusCode: 200,
    body: response_text,
    headers: {
      "content-type": String(headers["content-type"]) || "text/plain",
    },
    multiValueHeaders: {
      "set-cookie": cookie_header || [],
    },
  };
};
