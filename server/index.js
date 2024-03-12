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
};

init();
