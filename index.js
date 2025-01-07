const axios = require("axios");
const inquirer = require("inquirer");
const chalk = require("chalk");
const Table = require("cli-table3");

const BASE_URL = "https://swapi.py4e.com/api";

// Cache for API responses
const cache = new Map();

async function fetchData(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const response = await axios.get(url);
  cache.set(url, response.data);
  return response.data;
}

function displayAsTable(data, columns) {
  const table = new Table({
    head: columns.map((col) => chalk.yellow(col.header)),
    chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
  });

  table.push(columns.map((col) => data[col.key] || "N/A"));
  console.log(table.toString());
}

async function showMainMenu() {
  console.clear();
  console.log(chalk.yellow("\n=== Star Wars Information System ===\n"));

  const films = await fetchData(`${BASE_URL}/films`);

  const choices = films.results.map((film) => ({
    name: `Episode ${film.episode_id}: ${film.title} (${film.release_date})`,
    value: film,
  }));

  choices.push({ name: "Exit", value: "exit" });

  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Select a film to learn more:",
      choices,
    },
  ]);

  if (choice === "exit") {
    console.log(chalk.green("\nGoodbye!\n"));
    process.exit(0);
  }

  await showFilmDetails(choice);
}

async function showFilmDetails(film) {
  console.clear();
  console.log(chalk.yellow(`\n=== ${film.title} ===\n`));

  displayAsTable(film, [
    { header: "Episode", key: "episode_id" },
    { header: "Director", key: "director" },
    { header: "Release Date", key: "release_date" },
    { header: "Opening Crawl", key: "opening_crawl" },
  ]);

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to view?",
      choices: [
        { name: "Characters", value: "characters" },
        { name: "Planets", value: "planets" },
        { name: "Starships", value: "starships" },
        { name: "Back to Main Menu", value: "main" },
      ],
    },
  ]);

  switch (action) {
    case "characters":
      await showCharacters(film);
      break;
    case "planets":
      await showPlanets(film);
      break;
    case "starships":
      await showStarships(film);
      break;
    case "main":
      await showMainMenu();
      break;
  }
}

async function showCharacters(film) {
  const characters = await Promise.all(
    film.characters.map((url) => fetchData(url))
  );

  const { character } = await inquirer.prompt([
    {
      type: "list",
      name: "character",
      message: "Select a character:",
      choices: [
        ...characters.map((char) => ({
          name: char.name,
          value: char,
        })),
        { name: "Back", value: "back" },
      ],
    },
  ]);

  if (character === "back") {
    await showFilmDetails(film);
    return;
  }

  console.clear();
  console.log(chalk.yellow(`\n=== ${character.name} ===\n`));

  displayAsTable(character, [
    { header: "Height", key: "height" },
    { header: "Mass", key: "mass" },
    { header: "Hair Color", key: "hair_color" },
    { header: "Eye Color", key: "eye_color" },
    { header: "Birth Year", key: "birth_year" },
  ]);

  await promptReturn(() => showCharacters(film));
}

async function showPlanets(film) {
  const planets = await Promise.all(film.planets.map((url) => fetchData(url)));

  const { planet } = await inquirer.prompt([
    {
      type: "list",
      name: "planet",
      message: "Select a planet:",
      choices: [
        ...planets.map((planet) => ({
          name: planet.name,
          value: planet,
        })),
        { name: "Back", value: "back" },
      ],
    },
  ]);

  if (planet === "back") {
    await showFilmDetails(film);
    return;
  }

  console.clear();
  console.log(chalk.yellow(`\n=== ${planet.name} ===\n`));

  displayAsTable(planet, [
    { header: "Climate", key: "climate" },
    { header: "Terrain", key: "terrain" },
    { header: "Population", key: "population" },
    { header: "Diameter", key: "diameter" },
  ]);

  await promptReturn(() => showPlanets(film));
}

async function showStarships(film) {
  const starships = await Promise.all(
    film.starships.map((url) => fetchData(url))
  );

  const { starship } = await inquirer.prompt([
    {
      type: "list",
      name: "starship",
      message: "Select a starship:",
      choices: [
        ...starships.map((ship) => ({
          name: ship.name,
          value: ship,
        })),
        { name: "Back", value: "back" },
      ],
    },
  ]);

  if (starship === "back") {
    await showFilmDetails(film);
    return;
  }

  console.clear();
  console.log(chalk.yellow(`\n=== ${starship.name} ===\n`));

  displayAsTable(starship, [
    { header: "Model", key: "model" },
    { header: "Manufacturer", key: "manufacturer" },
    { header: "Crew", key: "crew" },
    { header: "Passengers", key: "passengers" },
    { header: "Class", key: "starship_class" },
  ]);

  await promptReturn(() => showStarships(film));
}

async function promptReturn(returnFunction) {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "Back", value: "back" },
        { name: "Main Menu", value: "main" },
      ],
    },
  ]);

  if (action === "back") {
    await returnFunction();
  } else {
    await showMainMenu();
  }
}

// Start the application
showMainMenu().catch(console.error);
