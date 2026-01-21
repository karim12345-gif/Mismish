import express from 'express';
import { getNearbyListings, getListingById } from '../../api/customer/listing/listing.controller';
import { validate } from '../../api/shared/middlewares/validate';
import { NearbyListingsSchema } from '../../api/shared/schemas/listingSchemas';

const router = express.Router();

router.get('/nearby', validate(NearbyListingsSchema), getNearbyListings);
router.get('/:id', getListingById);

export default router;
