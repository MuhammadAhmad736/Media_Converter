import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const cachedUserModel = mongoose.models.User;
if (cachedUserModel && !cachedUserModel.schema.path("isAdmin")) {
  mongoose.deleteModel("User");
}

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;