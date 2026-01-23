import { Request, Response, NextFunction } from 'express';
import prisma from '../../../prismaClient';
import { GetListingByIdParams, NearbyListingsQuery } from './types';


export const getNearbyListings = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { lat, lng, radius } = req.query as unknown as NearbyListingsQuery;

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseFloat(radius);

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusNum)) {
      res.status(400).json({ status: 'error', message: 'Invalid query parameters' });
      return;
    }

    // Use Prisma's $queryRaw for Haversine formula
    const listings = await prisma.$queryRaw`
      SELECT 
        sb.id, 
        sb.name, 
        sb.description, 
        sb.price, 
        sb."pickupStart", 
        sb."pickupEnd", 
        sb.quantity,
        v.id as "vendorId",
        v.name as "vendorName",
        v.latitude,
        v.longitude,
        (
          6371 * acos(
            cos(radians(${latNum})) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(${lngNum})) + 
            sin(radians(${latNum})) * sin(radians(v.latitude))
          )
        ) AS distance
      FROM "SurpriseBox" sb
      JOIN "Vendor" v ON sb."vendorId" = v.id
      WHERE 
        sb.quantity > 0 
        AND sb."pickupEnd" > NOW()
        AND (
          6371 * acos(
            cos(radians(${latNum})) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(${lngNum})) + 
            sin(radians(${latNum})) * sin(radians(v.latitude))
          )
        ) < ${radiusNum}
      ORDER BY distance ASC;
    `;

    res.status(200).json({ status: 'success', data: listings });
  } catch (error) {
    next(error);
  }
};

export const getListingById = async (
  req: Request<GetListingByIdParams>, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        res.status(400).json({ status: 'error', message: 'Invalid ID' });
        return;
    }

    const listing = await prisma.surpriseBox.findUnique({
      where: { id: parsedId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            address: true,
          }
        },
      },
    });

    if (!listing) {
      res.status(404).json({ status: 'error', message: 'Listing not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: listing });
  } catch (error) {
    next(error);
  }
};
