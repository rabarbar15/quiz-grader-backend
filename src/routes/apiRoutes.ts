import { Router } from "express";
import { GradingController } from "../controllers/gradingController";
import { FeedbackController } from "../controllers/feedbackController";
import { cancelGrading } from "../controllers/cancelController";

const router = Router();

router.post("/grade-questions", GradingController.gradeQuestions);
router.post("/generate-feedback", FeedbackController.generateFeedback);
router.post("/cancel-grading", cancelGrading);

export default router;
