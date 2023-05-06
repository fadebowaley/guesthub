const Room = require("../models/room");
const CronJobReport = require("../models/cronReport");

function updateRoomAvailability() {
  const currentDate = new Date();

  Room.find({ checkOut: { $lt: currentDate } })
    .then((rooms) => {
      if (rooms.length > 0) {
        const updates = rooms.map((room) =>
          Room.updateOne({ _id: room._id }, { available: true })
        );

        Promise.all(updates)
          .then(() => {
            console.log("Rooms availability updated");
            const report = new CronJobReport({
              jobName: "Update Room Availability",
              recordName: "Rooms",
              startTime: currentDate,
              endTime: new Date(),
              status: "SUCCESS",
              message: `${rooms.length} room(s) updated to available`,
            });
            report.save().catch((err) => console.log(err));
            console.log("Rooms availability saved");
          })
          .catch((err) => {
            console.log(err);
            const report = new CronJobReport({
              jobName: "Update Room Availability",
              recordName: "Rooms",
              startTime: currentDate,
              endTime: new Date(),
              status: "FAILURE",
              message: err.message,
            });
            report.save().catch((err) => console.log(err));
          });
      } else {
        console.log("No rooms to update");
      }
    })
    .catch((err) => console.log(err));
}

function checkOutRooms() {
  const currentDate = new Date();
  const noonToday = new Date();

  noonToday.setHours(12, 0, 0, 0);
  if (currentDate >= noonToday) {
    Room.find({ checkoutDate: { $lte: currentDate }, available: false })
      .then((rooms) => {
        if (rooms.length > 0) {
          const updates = rooms.map((room) =>
            Room.updateOne({ _id: room._id }, { available: true })
          );

          Promise.all(updates)
            .then(() => {
              console.log("Rooms checked out");
              const report = new CronJobReport({
                jobName: "Check Out Rooms",
                recordName: "Rooms",
                startTime: currentDate,
                endTime: new Date(),
                status: "SUCCESS",
                message: `${rooms.length} room(s) checked out`,
              });
              report.save().catch((err) => console.log(err));
            })
            .catch((err) => {
              console.log(err);
              const report = new CronJobReport({
                jobName: "Check Out Rooms",
                recordName: "Rooms",
                startTime: currentDate,
                endTime: new Date(),
                status: "FAILURE",
                message: err.message,
              });
              report.save().catch((err) => console.log(err));
            });
        } else {
          console.log("No rooms to check out");
        }
      })
      .catch((err) => console.log(err));
  }
}

module.exports = {
  checkOutRooms,
  updateRoomAvailability,
};
