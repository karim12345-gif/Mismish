import express from 'express';
import { createOrder, getMyOrders, getOrderById } from '../../api/customer/order/order.controller';
import { authenticate } from '../../api/shared/middlewares/auth';
import { validate } from '../../api/shared/middlewares/validate';
import { CreateOrderSchema } from '../../api/shared/schemas/orderSchemas';

const router = express.Router();

// Apply auth middleware to all order routes
router.use(authenticate);

router.post('/', validate(CreateOrderSchema), createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

export default router;
