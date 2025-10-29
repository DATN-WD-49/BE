import { config } from "dotenv";
import { throwError } from "../../common/utils/create-response.js";
import { SEAT_MESSAGES } from "./seat.messages.js";
import Seat from "./seat.model.js";

export const generateSeat = async (carId, floors = [], initFloor) => {
  if (!carId) throwError(400, SEAT_MESSAGES.ID_REQUIRED);
  if (!Array.isArray(floors) || floors.length === 0)
    throwError(400, SEAT_MESSAGES.QUANTITY_INVALID);

  const allSeats = [];
  let seatOrder = 0;

  for (let i = 0; i < floors.length; i++) {
    const { seatCount, cols } = floors[i];
    const floorNumber = i + 1;
    if (!seatCount || !cols) {
      throwError(400, `Thiếu dự liệu tầng ${floorNumber}`);
    }
    for (let j = 0; j < seatCount; j++) {
      seatOrder++;
      const row = Math.floor(j / cols);
      const col = (j % cols) + 1;
      const seatLabel = `${String.fromCharCode(65 + row)}${seatOrder}`;

      allSeats.push({
        carId,
        seatOrder,
        seatLabel,
        row: row + 1,
        col,
        floor: initFloor ? initFloor : floorNumber,
      });
    }
  }
  return { allSeats, totalSeats: allSeats.length };
};

export const ensureUniqueSeatLabel = async (carId, floor, seatLabel) => {
  let curentLabel = seatLabel;
  while (
    await Seat.findOne({
      carId,
      floor,
      seatLabel: curentLabel,
    })
  ) {
    const match = curentLabel.match(/^([A-Za-z]+)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const number = parseInt(match[2], 10) + 1;
      curentLabel = `${prefix}${number}`;
    } else {
      const suffixMatch = curentLabel.match(/(\d+)$/);
      curentLabel = suffixMatch
        ? curentLabel.replace(/\d+$/, (n) => parseInt(n, 10) + 1)
        : `${curentLabel}1`;
    }
  }
  return curentLabel;
};
