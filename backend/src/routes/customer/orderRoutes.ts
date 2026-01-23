import express from 'express';
import { createOrder, getMyOrders, getOrderById,
     validate, CreateOrderSchema, authenticate } from '../../api';

const router = express.Router();

// Apply auth middleware to all order routes
router.use(authenticate);

router.post('/', validate(CreateOrderSchema), createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

export default router;
