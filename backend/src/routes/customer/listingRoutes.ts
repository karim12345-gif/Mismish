import express from 'express';
import { getListingById, getNearbyListings, NearbyListingsSchema, validate } from '../../api';

const router = express.Router();

router.get('/nearby', validate(NearbyListingsSchema), getNearbyListings);
router.get('/:id', getListingById);

export default router;
