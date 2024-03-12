const {
  client,
  createTables,
  createUser,
  createPlace,
  fetchUsers,
  fetchPlaces,
  createVacation,
  fetchVacations,
  destroyVacation,
} = require("./db");

const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:userId/vacations/:id", async (req, res, next) => {
  try {
    await destroyVacation({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/vacations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createVacation({
        user_id: req.params.id,
        place_id: req.body.place_id,
        travel_date: req.body.travel_date,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/places", async (req, res, next) => {
  try {
    res.send(await fetchPlaces());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/vacations", async (req, res, next) => {
  try {
    res.send(await fetchVacations());
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [benson, rollins, fiona, barcelona, tokyo, london, oaxaca] =
    await Promise.all([
      createUser({ name: "benson" }),
      createUser({ name: "rollins" }),
      createUser({ name: "fiona" }),
      createPlace({ name: "barcelona" }),
      createPlace({ name: "tokyo" }),
      createPlace({ name: "london" }),
      createPlace({ name: "oaxaca" }),
    ]);
  console.log(await fetchUsers());
  console.log(await fetchPlaces());

  const vacations = await Promise.all([
    createVacation({
      user_id: benson.id,
      place_id: barcelona.id,
      travel_date: "04/10/2024",
    }),
    createVacation({
      user_id: rollins.id,
      place_id: oaxaca.id,
      travel_date: "04/10/2024",
    }),
    createVacation({
      user_id: fiona.id,
      place_id: london.id,
      travel_date: "04/21/2024",
    }),
  ]);
  console.log(await fetchVacations());

  await destroyVacation(vacations[0]);

  console.log(await fetchVacations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log("TEST OUT APP WITH curl:");
    console.log(`curl localhost:${port}/api/users`);
    console.log(`curl localhost:${port}/api/places`);
    console.log(`curl localhost:${port}/api/vacations`);
    console.log(
      `curl -X DELETE localhost:${port}/api/users/${fiona.id}/vacations${vacations[2].id}`
    );
    console.log(
      `curl -X POST localhost:${port}/api/users/${fiona.id}/vacations -d '{"travel_date": "05/01/2024", "place_id": "${oaxaca.id}"}' -H "Content-Type:application/json"`
    );
  });
};

init();
