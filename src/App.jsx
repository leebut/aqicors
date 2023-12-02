// The project code can be found on my Github repositiry at
// https://github.com/leebut/aqi
import { useEffect, useState } from "react";
import "./App.css";
import { data } from "autoprefixer";

// API key is stored in .env
const aqiKey = import.meta.env.VITE_AQI_TOKEN;
const baseUrl =
  "https://aqicors.netlify.app/.netlify/functions/cors/https://api.air-matters.app/";

export default function App() {
  // Define states
  const types = "lang=en&standard=aqi_us";

  const [query, setQuery] = useState("");
  const [startsWithQuery, setStartsWithQuery] = useState(false);
  const [aqiData, setAqiData] = useState([]);
  const [places, setPlaces] = useState([]);
  const [placeId, setPlaceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [findingPlaces, setFindingPlaces] = useState(false);
  const [error, setError] = useState("");

  // This effect listens to changes in the state: placeID and calls
  // the getAqiData function logic.
  useEffect(
    function () {
      // alert(placeId);
      if (placeId) {
        getAqiData(placeId);
      }
    },
    [placeId],
  );

  // This effect is debounced to prevent race conditions in the query on each
  // keypress in the search input, and calls the getPlaces function logic.
  useEffect(
    function () {
      const timerId = setTimeout(() => {
        getPlaces(query, setFindingPlaces);
        setAqiData([]);
      }, 1000);
      return () => clearTimeout(timerId);
    },
    [query],
  );

  // This function is called by the effect that takes the state: placeId
  async function getAqiData(placeId) {
    // ******* Use this const url for testing. *******
    const url =
      "https://corsproxy.io/?" +
      encodeURIComponent(
        `https://api.air-matters.app/current_air_condition?place_id=${placeId}&${types}`,
      );

    // ******* Use this const url for the build and deployment to Netlify. *******
    // const url = `${baseUrl}current_air_condition?place_id=${placeId}&${types}`;

    try {
      setIsLoading(true);
      setError("");
      const res = await fetch(url, {
        headers: {
          Authorization: `${aqiKey}`,
        },
      });

      if (!res.ok) throw new Error("Something went wrong fetching data.");

      const data = await res.json();
      if (data.places === null)
        throw new Error("Cannot find any places with that name");

      setAqiData(data.latest.readings);
      console.log(data.latest.readings);
    } catch (err) {
      // alert(err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Set the place Id with newId passed from the SELECT box in the PlacesList
  // component.
  function setNewPlaceId(newId) {
    setPlaceId(newId);
    console.log(`Updated with: ${newId}.`);
  }

  function handleSetQuery(val) {
    if (!val) {
      setAqiData([]);
      setPlaceId("");
      setPlaces([]);
    }
    setQuery(val);
  }

  function handleStartsWithQuery() {
    setStartsWithQuery(!startsWithQuery);
  }

  function handleReset() {
    setAqiData([]);
    setPlaceId("");
    setPlaces([]);
  }

  // Query the API with the last debounced value of the effect dependent on
  // the state: query.
  function getPlaces(query, setFindingPlaces) {
    if (!query) {
      return;
    }
    async function getPlacesList() {
      setError("");
      try {
        setFindingPlaces(true);

        const url =
          "https://corsproxy.io/?" +
          encodeURIComponent(
            `https://api.air-matters.app/place_search?lang=en&content=${query}`,
          );
        // const url = `${baseUrl}place_search?lang=en&content=${query}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `${aqiKey}`,
          },
        });

        if (!res.ok) throw new Error("Something went wrong fetching places.");

        const data = await res.json();
        if (data.places === null)
          throw new Error("Cannot find any places with that name");

        setPlaces(data.places);
        // console.log(data.places);
      } catch (err) {
        // alert(err.message);
        setError(err.message);
      } finally {
        setFindingPlaces(false);
      }
    }
    getPlacesList();
  }

  return (
    <div className="flex flex-col items-center">
      {/* <SearchBar query={query} setQuery={setQuery} /> */}
      <SearchBar query={query} onHandleSetQuery={handleSetQuery} />
      <StartsWithQueryBtn
        onHandleStartsWithQuery={handleStartsWithQuery}
        startsWithQuery={startsWithQuery}
        query={query}
      />
      <Header places={places} placeId={placeId} query={query} />

      {/* <Button onGetPlaces={getPlaces} /> */}
      <Box>
        {findingPlaces && <FindingPlacesMsg />}
        {!findingPlaces && !error && (
          <PlacesList
            places={places}
            onSetNewPlaceId={setNewPlaceId}
            query={query}
            startsWithQuery={startsWithQuery}
          />
        )}
        {error && <ErrorMessage message={error} />}
      </Box>

      <Box>
        {isLoading && <Loading />}
        {!isLoading && !error && (
          <AqiList aqiData={aqiData} query={query} placeId={placeId} />
        )}
        {error && <ErrorMessage message={error} />}
      </Box>
      <Footer />
    </div>
  );
}

function StartsWithQueryBtn({
  onHandleStartsWithQuery,
  startsWithQuery,
  query,
}) {
  return !startsWithQuery ? (
    <button
      className="text-white text-2xl bg-sky-800 border-2 border-sky-200 mb-8 mt-2 p-4 font-bold transition-all duration-200"
      onClick={() => onHandleStartsWithQuery()}
    >
      Click to only show places starting with{" "}
      <span className="text-yellow-300">{query.toUpperCase()}</span>
    </button>
  ) : (
    <button
      className="text-white text-2xl bg-green-800 border-2 border-lime-200 mb-8 mt-2 p-4 font-bold transition-all duration-200"
      onClick={() => onHandleStartsWithQuery()}
    >
      Click to show all places containing{" "}
      <span className="text-yellow-300">{query.toUpperCase()}</span>
    </button>
  );
}

function SearchBar({ query, onHandleSetQuery }) {
  return (
    <>
      <h2 className="text-6xl text-orange-400 font-bold mt-4 mb-6">
        Air Quality
      </h2>
      <input
        className="h-25 border-4 border-orange-800 text-3xl p-5 my-3 outline-none text-black bg-orange-300 rounded-full placeholder-gray-700 focus:placeholder-white focus:bg-sky-600 focus:border-cyan-200 focus:text-white transition-all duration-300"
        type="text"
        autoFocus
        placeholder="Enter query..."
        value={query}
        onChange={(e) => onHandleSetQuery(e.target.value)}
      />
      <h2 className="text-2xl font-bold text-white mt-10">filter results</h2>
    </>
  );
}

function Header({ placeId, places, query }) {
  if (!query) {
    return;
  }
  return (
    <>
      {places.length > 0 && (
        <div className="flex flex-wrap justify-center">
          {places?.map((placeList) => (
            <PlaceHeaders
              placeId={placeId}
              places={placeList}
              key={placeList.place_id}
            />
          ))}
        </div>
      )}
    </>
  );
}

function PlaceHeaders({ places, placeId }) {
  return (
    <>
      {places.place_id === placeId && (
        <>
          <h1 className="flex items-center flex-wrap text-4xl m-3 py-2 px-5 border-4 rounded-full border-lime-400 bg-green-100 font-bold">
            {places.name}
          </h1>
          <h2 className="flex items-center text-2xl m-3 px-3 border-4 border-sky-100 rounded-full bg-sky-400 font-bold">
            {places.description}
          </h2>
        </>
      )}
    </>
  );
}

function FindingPlacesMsg() {
  return (
    <>
      <h2 className="text-4xl font-bold text-orange-400">Fetching places...</h2>
    </>
  );
}

function PlacesList({ places, onSetNewPlaceId, query, startsWithQuery }) {
  if (places.length === 0) {
    return;
  }

  // This is a rudimentary filter to be executed when the filter button is
  // clicked to only show places that start with the search query.
  let filteredRes = [];

  if (startsWithQuery) {
    // filteredRes = [];
    const queryToUpper = query[0].toUpperCase() + query.substring(1);

    for (let place of places) {
      if (place.name.startsWith(queryToUpper)) {
        filteredRes.push(place);
      }
    }
    // console.log(
    //   `FOUND ${filteredRes.length} PLACES BEGINNING WITH ${queryToUpper}`,
    // );
  }

  return (
    <>
      {filteredRes.length > 0 && (
        <h2 className="mt-6 text-white text-4xl font-bold text-center">
          {filteredRes.length} places filtered.
        </h2>
      )}
      <select
        className="m-4 w-screen sm:w-[50rem] text-2xl even:bg-slate-300 p-4 border-4 rounded-full border-l-teal-700"
        onChange={(e) => onSetNewPlaceId(e.target.value)}
      >
        <option className="text-2xl text-center" value="">
          ↓↓↓ Places found - See below ↓↓↓
        </option>

        {places?.map((placeList) => (
          <PlaceItems
            onSetNewPlaceId={onSetNewPlaceId}
            places={placeList}
            key={placeList.place_id}
            query={query}
            startsWithQuery={startsWithQuery}
          />
        ))}
      </select>
    </>
  );
}

function PlaceItems({ places, query, startsWithQuery }) {
  const queryToUpper = query[0].toUpperCase() + query.substring(1);

  if (startsWithQuery) {
    return places.name.startsWith(queryToUpper) ? (
      <option className="text-2xl even:bg-slate-300" value={places.place_id}>
        {places.name} - {places.description}
      </option>
    ) : null;
  }

  return (
    !startsWithQuery && (
      <option className="text-2xl even:bg-slate-300" value={places.place_id}>
        {places.name} - {places.description}
      </option>
    )
  );
}

function Box({ children }) {
  return <div>{children}</div>;
}

function Loading() {
  return (
    <>
      <h1 className="text-slate-200 text-4xl font-bold">
        <span>💾</span> LOADING...
      </h1>
    </>
  );
}
function ErrorMessage({ message }) {
  return (
    <>
      <h1 className="text-2xl text-red-700">
        <span>⛔</span> {message}
      </h1>
    </>
  );
}
function AqiList({ aqiData, query, placeId }) {
  if (!placeId) {
    return;
  }

  if (aqiData === undefined) {
    return (
      <>
        <h1 className="text-slate-200 text-4xl font-bold">
          <span>🙅‍♂️</span> No data for this location. <span>🙅‍♀️</span>
        </h1>
      </>
    );
  }

  return (
    <ul className="gap-4 mt-5 w-[50rem] border-4 border-green-600 bg-sky-950 p-4 rounded-xl grid grid-cols-2 relative">
      {aqiData?.map((datapoint) => (
        <EachOne dataPoint={datapoint} key={datapoint.kind} />
      ))}
    </ul>
  );
}

function EachOne({ dataPoint }) {
  return (
    <>
      <li className="relative mx-4 gap-3 grid grid-cols-2 items-end bg-slate-600 p-2 rounded-lg border-2 border-slate-500">
        <p className="text-right">
          <span className="text-3xl text-slate-100">{dataPoint.name}:</span>
        </p>
        <p>
          <span
            className="text-5xl font-bold"
            style={{ color: `${dataPoint.color}` }}
          >
            {dataPoint.value}
          </span>
          &nbsp;
          <span
            className={
              dataPoint.unit ? "text-xl text-yellow-400" : "text-transparent"
            }
          >
            ({dataPoint.unit})
          </span>
        </p>
      </li>
    </>
  );
}

function Footer() {
  return (
    <>
      <p className="text-slate-300 text-xl mt-7">
        <strong>NOTE:</strong> This app can only make 1,000 requests per day, so
        it may not always be available.
      </p>
    </>
  );
}
