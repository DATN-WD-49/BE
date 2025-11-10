import mongoose from "mongoose";
import { regexLower } from "../../common/utils/regex.js";
import Route from "./route.model.js";

export const checkDuplicateRoute = async (
  pickupPoint,
  dropPoint,
  description,
  excludeId = null,
) => {
  const baseCondition = {
    "pickupPoint.label": regexLower(pickupPoint.label),
    "dropPoint.label": regexLower(dropPoint.label),
    description: regexLower(description),
  };
  if (excludeId) {
    baseCondition._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }
  const routes = await Route.find(baseCondition).lean();
  if (!routes.length) return null;
  for (const route of routes) {
    const pickDistricts =
      pickupPoint.district?.map((d) => d.label.toLowerCase()) || [];
    const dropDistricts =
      dropPoint.district?.map((d) => d.label.toLowerCase()) || [];
    const pickDistrictExist = route.pickupPoint?.district?.some((d) =>
      pickDistricts.includes(d.label.toLowerCase()),
    );
    const dropDistrictExist = route.dropPoint?.district?.some((d) =>
      dropDistricts.includes(d.label.toLowerCase()),
    );
    if (pickDistrictExist && dropDistrictExist) {
      return route;
    }
  }
  return null;
};
