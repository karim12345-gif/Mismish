import { Request, Response, NextFunction } from 'express';
import { DeliveryMethod, Prisma } from '@prisma/client';
import prisma from '../../../prismaClient';

// Interface for the request body
interface CreateOrderBody {
  surpriseBoxId: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
}

// Helper to generate a 6-character alphanumeric code
const generateOrderCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createOrder = async (req: Request<{}, {}, CreateOrderBody>, res: Response, next: NextFunction) => {
  try {
    const { surpriseBoxId, deliveryMethod, deliveryAddress } = req.body;
    // req.user is populated by the auth middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    // Interactive Transaction
    const order = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      // 1. Check availability
      const box = await transaction.surpriseBox.findUnique({
        where: { id: surpriseBoxId },
      });

      if (!box) {
        throw new Error('Surprise Box not found');
      }

      if (box.quantity <= 0) {
        throw new Error('Surprise Box is out of stock');
      }

      if (new Date(box.pickupEnd) < new Date()) {
          throw new Error('Pickup time has ended');
      }

      // 2. Decrement quantity
      await transaction.surpriseBox.update({
        where: { id: surpriseBoxId },
        data: { quantity: { decrement: 1 } },
      });

      // 3. Create Order with unique code
      // Loop to ensure uniqueness (though collision probability for 6 chars is low for MVP)
      let orderCode = generateOrderCode();
      let isUnique = false;
      while (!isUnique) {
        const existing = await transaction.order.findUnique({ where: { orderCode } });
        if (!existing) isUnique = true;
        else orderCode = generateOrderCode();
      }

      const newOrder = await transaction.order.create({
        data: {
          userId,
          surpriseBoxId,
          deliveryMethod,
          deliveryAddress: deliveryMethod === DeliveryMethod.DELIVERY ? deliveryAddress : undefined,
          status: 'PENDING',
          orderCode,
          pickupStatus: 'PENDING'
        },
      });

      return newOrder;
    });

    res.status(201).json({ status: 'success', data: order });
  } catch (error: any) {
    if (error.message === 'Surprise Box not found' || error.message === 'Surprise Box is out of stock' || error.message === 'Pickup time has ended') {
      res.status(400).json({ status: 'error', message: error.message });
    } else {
      next(error);
    }
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        surpriseBox: {
          include: {
            vendor: {
              select: { name: true, address: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const orderId = parseInt(req.params.id as string);

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    if (isNaN(orderId)) {
        res.status(400).json({ status: 'error', message: 'Invalid order ID' });
        return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        surpriseBox: {
          include: {
            vendor: true
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ status: 'error', message: 'Order not found' });
      return;
    }

    // Ensure the order belongs to the requesting user
    if (order.userId !== userId) {
      res.status(403).json({ status: 'error', message: 'Forbidden' });
      return;
    }

    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    next(error);
  }
};
