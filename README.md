# Air Quality API Project

I am learning React from Jonas Schmedtmann on Udemy.  
This app uses the _Air Matters_ API ([https://dev.air-matters.com](https://dev.air-matters.com)).

### Project URL

[https://aqiapp.netlify.app/](https://aqiapp.netlify.app/)

### Dependencies

- Vite
- tailwindscss - postcss - autoprefixer

## Usage

Type the name of the place you want to get the air qualitry of. One second after you stop typing, the app will send the fetch request and populate the list of places found SELECT box.

Click on the box and click on the location you want to see the data for.

> I am using the free tier for the app since this is a learning project, so it is limited to 1,000 requests per day.

## CORS

I was disturbed by CORS errors, but after searching, I discovered [https://corsproxy.io](https://corsproxy.io). When I learn more, I'll look into implementing my own CORS handler.

## NOTES

For now, I'm concered with data fetching and dealing with it rather than focus on the UI. Later, I'll improve the UI and make it responsive.
Since I am learning, there may be parts of the code that I have not implemented correctly.
