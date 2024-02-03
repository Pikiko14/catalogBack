import { Router } from "express";
import { upload } from "../utils/storage";
import { ProfileController } from "../controllers/profile.controller";
import { updateProfileValidator, validateConfigurationData, validateProfileId } from "../validators/profile.validator";
import sessionCheck from "../middlewares/session.middleware";
import perMissionMiddleware from "../middlewares/permission.middleware";
import { UserIdValidator } from "../validators/users.validator";

// init router
const router = Router();

// controllers instances
const profileController = new ProfileController();

//store or update profile
router.put(
    '/',
    sessionCheck,
    perMissionMiddleware('update-profile'),
    updateProfileValidator,
    profileController.createOrUpdateProfile,
);

// list profile
router.get(
    '/:id',
    sessionCheck,
    perMissionMiddleware('list-profile'),
    UserIdValidator,
    profileController.getProfile,
);

// change profile pictury
router.post(
    '/image/change',
    sessionCheck,
    perMissionMiddleware('change-profile-pictury'),
    upload.single('file'),
    validateProfileId,
    profileController.changeProfilePictury,
);

router.put(
    '/:profile/configuration/set',
    sessionCheck,
    perMissionMiddleware('update-profile'),
    validateProfileId,
    validateConfigurationData,
    profileController.setConfigurationOnProfile,
);

export { router };
