import { ROOT_MESSAGES } from "../constants/messages.js";
import { throwError } from "../utils/create-response.js";

export const vaildRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!userRole) {
      console.log("not role");
      throwError(401, ROOT_MESSAGES.UNAUTHORIZED);
    }
    if (!roles.includes(userRole)) {
      console.log("not cap");
      throwError(403, ROOT_MESSAGES.FORBIDDEN);
    }
    next();
  };
};
