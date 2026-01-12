import dayjs from "dayjs";
import { getIO } from "../../socket/socket.instance.js";
import cron from "node-cron";
import User from "../user/user.model.js";

export const cleanExpiredLockUsers = async () => {
  try {
    const now = dayjs().toDate();
    const expiredLockUsers = await User.find({
      isLocked: true,
      expiredBanned: { $lte: now },
    });
    if (expiredLockUsers.length > 0) {
      const UserIds = expiredLockUsers.map((user) => user._id.toString());
      const ressult = await User.updateMany(
        {
          _id: { $in: expiredLockUsers.map((seat) => seat._id) },
        },
        [
          {
            $set: {
              expiredBanned: null,
              isLocked: false,
            },
          },
        ],
      );
      console.log(
        `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] Unlocked ${ressult.deletedCount} Users.`,
      );
      const io = getIO();
      UserIds.forEach((UserId) => {
        io.to(UserId).emit("UserUnlocked", {
          message: "Some Users have unlocked",
          deletedCount: ressult.deletedCount,
          timestamp: dayjs().toISOString(),
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export const startLockUsersExpiredJob = () => {
  console.log("✓ Unlocked User job started.");
  const task = cron.schedule("0 0 * * *", async () => {
    console.log("✓ Unlocked User runtime");
    await cleanExpiredLockUsers();
  });
  return task;
};
