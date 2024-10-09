const express = require("express");
const router = express.Router();
const fs = require("fs");

router.get("/", (req, res, next) => {
  const allowedFilter = ["search", "type", "page", "limit"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    const filterKeys = Object.keys(filterQuery);
    console.log("filter", filterKeys);
    filterKeys?.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    let offset = limit * (page - 1);
    let db = fs.readFileSync("pokemondb.json", "utf-8");
    pokemondbd = JSON.parse(db);
    const { data } = pokemondbd;
    let result = [];
    let resultType = data;
    if (filterKeys.length) {
      if (data.length > 0 && filterQuery.type) {
        resultType = data.filter((pokemon) =>
          pokemon.types.includes(filterQuery.type)
        );
        result = resultType;
    }

      if (resultType.length > 0 && filterQuery.search) {
        if (isNaN(filterQuery.search)) {
          console.log("nstring to be here");
          result = resultType.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(filterQuery.search)
          );
        } else {
          console.log("number to be here");
          result = resultType.filter(
            (pokemon) => pokemon.id == filterQuery.search
          );
        }
      }
    } else {
      result = resultType;
    }
    result = result.slice(offset, offset + limit);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});
router.get("/:id", (req, res, next) => {
  try {
    const { id } = req.params;
    pokemonId = parseInt(id);
    if (!pokemonId) {
      const exception = new Error(`ID can not be null`);
      exception.statusCode = 404;
      throw exception;
    }
    if (pokemonId > 721 || pokemonId < 1) {
      const exception = new Error(`Cannot find`);
      exception.statusCode = 404;
      throw exception;
    }

    let db = fs.readFileSync("pokemondb.json", "utf-8");
    pokemondbd = JSON.parse(db);
    const { data } = pokemondbd;
    let result = { pokemon: {}, previousPokemon: {}, nextPokemon: {} };

    const pokemonIndex = data.findIndex((pokemon) => pokemon.id === pokemonId);
    let prein = pokemonIndex == 0 ? data.length - 1 : pokemonIndex - 1;
    let nextin = pokemonIndex + 1 >= data.length ? 0 : pokemonIndex + 1;
    const targetIndex = data.find((pokemon) => pokemon.id === pokemonId);

    result.pokemon = targetIndex;
    const preIndex = data[prein];
    result.previousPokemon = preIndex;
    const nextIndex = data[nextin];
    result.nextPokemon = nextIndex;

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});
router.post("/", (req, res, next) => {
  const pokemonTypes = [
    "bug",
    "dragon",
    "fairy",
    "fire",
    "ghost",
    "ground",
    "normal",
    "psychic",
    "steel",
    "dark",
    "electric",
    "fighting",
    "flyingText",
    "grass",
    "ice",
    "poison",
    "rock",
    "water",
  ];
  try {
    const { id, name, types, url } = req.body;
    if (!id || !name || !types || !url) {
      const exception = new Error(`Missing required data`);
      exception.statusCode = 401;
      throw exception;
    }
    if (types.length > 2) {
      const exception = new Error(`Pokémon can only have one or two types`);
      exception.statusCode = 401;
      throw exception;
    }
    if (!pokemonTypes.includes(types[0].toLowerCase())) {
      const exception = new Error(`Pokémon's type is invalid`);
      exception.statusCode = 401;
      throw exception;
    }
    if (types[1]) {
      if (!pokemonTypes.includes(types[1].toLowerCase())) {
        const exception = new Error(`Pokémon's type is invalid`);
        exception.statusCode = 401;
        throw exception;
      }
    }
    let db = fs.readFileSync("pokemondb.json", "utf-8");
    pokemondbd = JSON.parse(db);
    const { data } = pokemondbd;
    let checkDuplicate = data.find((pokemon) => pokemon.id === id);
    if (checkDuplicate) {
      const exception = new Error(`The Pokémon already exists`);
      exception.statusCode = 401;
      throw exception;
    }
    checkDuplicate = data.find((pokemon) => pokemon.name === name);
    if (checkDuplicate) {
      const exception = new Error(`The Pokémon already exists`);
      exception.statusCode = 401;
      throw exception;
    }
    const newPoke = {
      id,
      name,
      types,
      url,
    };
    data.push(newPoke);
    pokemondbd.data = data;
    pokemondbd.totalPokemons += 1;
    fs.writeFileSync("pokemondb.json", JSON.stringify(pokemondbd));
    res.status(200).send(newPoke);
  } catch (error) {
    next(error);
  }
});

router;

module.exports = router;
