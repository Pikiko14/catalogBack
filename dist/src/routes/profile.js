"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const session_middleware_1 = __importDefault(require("../middlewares/session.middleware"));
const users_validator_1 = require("../validators/users.validator");
const storage_s3_1 = require("../utils/storage.s3");
const profile_controller_1 = require("../controllers/profile.controller");
const permission_middleware_1 = __importDefault(require("../middlewares/permission.middleware"));
const profile_validator_1 = require("../validators/profile.validator");
// init router
const router = (0, express_1.Router)();
exports.router = router;
// controllers instances
const profileController = new profile_controller_1.ProfileController();
//store or update profile
router.put('/', session_middleware_1.default, (0, permission_middleware_1.default)('update-profile'), profile_validator_1.updateProfileValidator, profileController.createOrUpdateProfile);
// list profile
router.get('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('list-profile'), users_validator_1.UserIdValidator, profileController.getProfile);
// change profile pictury
router.post('/image/change', session_middleware_1.default, (0, permission_middleware_1.default)('change-profile-pictury'), storage_s3_1.uploadS3.single('file'), storage_s3_1.validateFileSize, profile_validator_1.validateProfileId, profileController.changeProfilePictury);
router.put('/:profile/configuration/set', session_middleware_1.default, (0, permission_middleware_1.default)('update-profile'), profile_validator_1.validateProfileId, profile_validator_1.validateConfigurationData, profileController.setConfigurationOnProfile);
