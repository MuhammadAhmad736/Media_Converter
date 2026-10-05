import mongoose, { Schema, models, model } from "mongoose";

const visitorSchema = new Schema(
  {
    counter: {
      type: Number,
      default: 0,
    },
    ipAddresses: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "visitors",
  }
);

const Visitor =
  models.Visitor || model("Visitor", visitorSchema);

export default Visitor;