const seedData = require("./seedDB/seed");
const fs = require("fs/promises");

// check if the rooms have already been seeded
(async () => {
  try {
    const flag = await fs.readFile("seeded.txt", "utf-8");
    if (flag === "true") {
      console.log("Data have already been seeded!");
      return;
    }
  } catch (error) {
    // ignore errors when the file does not exist
    if (error.code !== "ENOENT") {
      console.error("Error reading seeded flag:", error);
      return;
    }
  }

  // call the seedRooms function if the rooms have not been seeded
  try {
    await seedData();
    console.log("Rooms seeded successfully!");
    await fs.writeFile("seeded.txt", "true");
    console.log("Seed flag set!");
  } catch (error) {
    console.error("Error seeding rooms:", error);
  }
})();
