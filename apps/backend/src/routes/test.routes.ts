import { Router } from 'express';
import * as TestController from '../controllers/test.controller';

const router = Router();

router.get('/:id', TestController.getTest);
router.post('/:id/submit', TestController.submitTest);

export default router;
