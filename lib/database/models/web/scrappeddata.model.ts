import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    link: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const File = mongoose.models?.File || mongoose.model("File", FileSchema);

export default File;
