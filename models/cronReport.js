const Schema = require("mongoose").Schema;
const { conn } = require("../config/dbb");

const cronJobReportSchema = Schema({
  jobName: {
    type: String,
    required: true,
  },
  recordName: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["SUCCESS", "FAILURE"],
    required: true,
  },
  message: {
    type: String,
    default: "",
  },
});

module.exports = conn.model("CronJobReport", cronJobReportSchema);
