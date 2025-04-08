const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  UserId: { type: Number, required: true },
  UserName: { type: String, required: true },
  CellNos: [{ type: Number, required: true }],
  emailIds: [{ type: String, required: true }],
});

const beaconsDetailSchema = new Schema({
  LowValue: { type: Number, required: true },
  HighValue: { type: Number, required: true },
  MessageOcc: { type: String, required: true },
  MessageRes: { type: String, required: true },
  StartTime: { type: Date, required: true },
  EndTime: { type: Date, required: true },
  StartThSec: { type: Number, required: true },
  EndThSec: { type: Number, required: true },
  Duration: { type: Number, required: true },
  Status: { type: Boolean, required: true },
  RangeNo: { type: Number, required: true },
});

const esBeaconSchema = new Schema(
  {
    _id: { type: Number, required: true },
    BeaconsName: { type: String, required: true },
    BeaconsDisplayName: { type: String, required: true },
    SMS: { type: Boolean, required: true },
    PopUp: { type: Boolean, required: true },
    WhatsApp: { type: Boolean, required: true },
    EMail: { type: Boolean, required: true },
    Enable: { type: Boolean, required: true },
    UserList: [userSchema],
    BeaconsDetails: [beaconsDetailSchema],
  },
  { collection: "ESBeacon" }
);

module.exports = mongoose.model("ESBeacon", esBeaconSchema);
