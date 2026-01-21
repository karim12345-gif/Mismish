import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../../prismaClient';

interface RegisterVendorBody {
  email: string;
  password: string;
  name: string;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

interface LoginVendorBody {
  email: string;
  password: string;
}

export const registerVendor = async (req: Request<{}, {}, RegisterVendorBody>, res: Response): Promise<void> => {
  try {
    const { email, password, name, address, description, latitude, longitude } = req.body;

    const existingVendor = await prisma.vendor.findUnique({ where: { email } });
    if (existingVendor) {
      res.status(400).json({ status: 'error', message: 'Vendor already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = await prisma.vendor.create({
      data: {
        email,
        password: hashedPassword,
        name,
        address,
        description,
        latitude,
        longitude,
      },
    });

    const token = jwt.sign({ id: vendor.id, type: 'vendor' }, process.env.JWT_SECRET as string, { expiresIn: '1d' });

    res.status(201).json({ 
      status: 'success', 
      data: { 
        token, 
        vendor: { 
          id: vendor.id, 
          email: vendor.email, 
          name: vendor.name 
        } 
      } 
    });
  } catch (error) {
    console.error('Register Vendor Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const loginVendor = async (req: Request<{}, {}, LoginVendorBody>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: vendor.id, type: 'vendor' }, process.env.JWT_SECRET as string, { expiresIn: '1d' });

    res.status(200).json({ 
      status: 'success', 
      data: { 
        token, 
        vendor: { 
          id: vendor.id, 
          email: vendor.email, 
          name: vendor.name 
        } 
      } 
    });
  } catch (error) {
    console.error('Login Vendor Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
