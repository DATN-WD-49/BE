import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
    },
    crew: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        role: {
          type: String,
          enum: ["driver", "assistant"],
          required: true,
        },
      },
    ],
    price: {
      type: Number,
    },
    weekdays: {
      type: [Number],
      default: [],
    },
    status: {
      type: Boolean,
      default: true,
    },
    isDisable: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
