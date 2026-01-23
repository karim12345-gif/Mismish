import express from 'express';
import { LoginSchema, loginVendor, registerVendor, SignupSchema, validate } from '../../api';

const router = express.Router();

router.post('/signup', validate(SignupSchema), registerVendor);
router.post('/login', validate(LoginSchema), loginVendor);

export default router;
