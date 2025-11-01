const express = require("express");
const {
  authenticateUser,
  roleMiddleware,
  verifyAdminToken,
} = require("../middleware/authMiddleware");
const {
  loginAdmin,
  logoutAdmin,
  uploadFile,
  getNotification,
  deleteNotification,
  markNotificationAsRead,
  createUserByAdmin,
  editUserAccount,
  deleteUserAccount,
  getRegistrarUsers,
  upload,
  getAllUsers,
  updateExternalUser,
  deleteExternalUser,
  loginLimiter,
  registerAdmin,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/login", loginLimiter, loginAdmin);
router.get("/logout", logoutAdmin);

router.get(
  "/users",
  authenticateUser,
  roleMiddleware(["admin"]),
  getRegistrarUsers
);
router.post(
  "/createUser",
  authenticateUser,
  roleMiddleware(["admin"]),
  createUserByAdmin
);
router.put('/editUser/:id', 
 upload.single('photo'),
  authenticateUser,
  roleMiddleware(["admin"]),

    editUserAccount);
router.delete(
  "/deleteUser/:userId",
  authenticateUser,
  roleMiddleware(["admin"]),
  deleteUserAccount
);

router.post(
  "/upload",
  roleMiddleware(["admin"]),
  authenticateUser,
  uploadFile
);

router.post("/register", registerAdmin);

router.get("/externalUsers", authenticateUser, roleMiddleware(["admin"]), getAllUsers);
router.put("/externalUsers/:id", authenticateUser, roleMiddleware(["admin"]), updateExternalUser);
router.delete("/externalUsers/:id", authenticateUser, roleMiddleware(["admin"]), deleteExternalUser);
router.get("/notifications", getNotification);
router.delete("/notifications/:id", deleteNotification);
router.put("/notifications/:id/read", markNotificationAsRead);

module.exports = router;
