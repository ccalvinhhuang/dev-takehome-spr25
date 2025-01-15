import mongoose, { Schema } from "mongoose";

const requestSchema = new Schema({
  requestorName: { type: String, required: true, minlength: 3, maxlength: 30 },
  itemRequested: { type: String, required: true, minlength: 2, maxlength: 100 },
  createdDate: { type: Date, required: true, default: Date.now },
  lastEditedDate: { type: Date, default: null },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "approved", "rejected"],
    default: "pending",
  },
});

const Request = mongoose.model("Request", requestSchema);
export default Request;
