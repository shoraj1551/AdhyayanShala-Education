import { Router } from 'express';
import * as CourseController from '../controllers/course.controller';

const router = Router();

router.get('/', CourseController.getCourses);
router.get('/:id', CourseController.getCourse);

export default router;
