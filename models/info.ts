import mongoose, { Schema, models, model } from "mongoose";

// Download schema stores every MP3/MP4 download made by a user
const downloadSchema = new Schema(
  {
    // Reference to the user who made the download
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // YouTube video title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // MP4 or MP3
    format: {
      type: String,
      enum: ["MP4", "MP3"],
      required: true,
    },

    // Name of the platform where the media came from
    platform: {
      type: String,
      required: true,
      trim: true,
    },

    // Example: 1080p, 720p, Audio
    quality: {
      type: String,
      required: true,
    },

    // File size in bytes
    fileSize: {
      type: Number,
      default: 0,
    },

    // Download status
    status: {
      type: String,
      enum: ["Successful", "Failed"],
      required: true,
    },

    // Date when download was created
    date: {
      type: Date,
      default: Date.now,
    },

    // Media length in seconds
    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Refresh the cached model when its schema does not support guest download records.
const cachedDownloadModel = models.Download;
if (
  cachedDownloadModel &&
  (cachedDownloadModel.schema.path("userId")?.options.required === true ||
    !cachedDownloadModel.schema.path("platform") ||
    !cachedDownloadModel.schema.path("duration"))
) {
  mongoose.deleteModel("Download");
}

const Download = models.Download || model("Download", downloadSchema);

export default Download;