import { Router } from "express";
import { verifySessionToken } from "../middleware/auth.js";
import prisma from "../services/prismaClient.js";

const router = Router();

const MOCK_DIAMONDS = [
  { id: "d-001", shape: "Round",    carat: 1.00, color: "D", clarity: "VVS1", price: 8500,  image_url: "https://placehold.co/300x300?text=Round+1ct",    available: true  },
  { id: "d-002", shape: "Princess", carat: 0.75, color: "E", clarity: "VVS2", price: 4200,  image_url: "https://placehold.co/300x300?text=Princess+0.75ct", available: true  },
  { id: "d-003", shape: "Oval",     carat: 1.50, color: "F", clarity: "VS1",  price: 9800,  image_url: "https://placehold.co/300x300?text=Oval+1.5ct",    available: true  },
  { id: "d-004", shape: "Cushion",  carat: 2.00, color: "G", clarity: "VS2",  price: 14000, image_url: "https://placehold.co/300x300?text=Cushion+2ct",   available: false },
  { id: "d-005", shape: "Emerald",  carat: 1.25, color: "D", clarity: "IF",   price: 12500, image_url: "https://placehold.co/300x300?text=Emerald+1.25ct", available: true  },
  { id: "d-006", shape: "Pear",     carat: 0.90, color: "H", clarity: "SI1",  price: 3800,  image_url: "https://placehold.co/300x300?text=Pear+0.9ct",    available: true  },
  { id: "d-007", shape: "Radiant",  carat: 1.10, color: "E", clarity: "VVS1", price: 7600,  image_url: "https://placehold.co/300x300?text=Radiant+1.1ct",  available: true  },
  { id: "d-008", shape: "Asscher",  carat: 0.80, color: "F", clarity: "VS1",  price: 4900,  image_url: "https://placehold.co/300x300?text=Asscher+0.8ct",  available: false },
  { id: "d-009", shape: "Marquise", carat: 1.30, color: "G", clarity: "VS2",  price: 6700,  image_url: "https://placehold.co/300x300?text=Marquise+1.3ct", available: true  },
  { id: "d-010", shape: "Heart",    carat: 1.00, color: "D", clarity: "FL",   price: 11000, image_url: "https://placehold.co/300x300?text=Heart+1ct",      available: true  },
];

// GET /api/public/diamonds — no JWT, requires ?shop= query param
// Called directly from the Theme Extension widget in the buyer's browser.
export async function handlePublicDiamonds(req, res, next) {
  try {
    const { shop } = req.query;
    if (!shop) {
      return res.status(400).json({ error: "shop query parameter is required" });
    }

    const session = await prisma.session.findUnique({ where: { shop } });
    if (!session) {
      return res.status(403).json({ error: "shop not authorized" });
    }

    res.json({ diamonds: MOCK_DIAMONDS });
  } catch (err) {
    next(err);
  }
}

// GET /api/diamonds
// Fetch full diamond catalog from Payal's API and return to caller.
// Called by: Remix admin UI + Theme Extension widget directly.
router.get("/", verifySessionToken, async (req, res, next) => {
  // TODO: call payalApi.getDiamonds() with filters from req.query
  // TODO: return diamond list as JSON
});

// GET /api/diamonds/:id
// Fetch a single diamond's full details by ID from Payal's API.
// Called by: Theme Extension widget product page.
router.get("/:id", verifySessionToken, async (req, res, next) => {
  // TODO: call payalApi.getDiamondById(req.params.id)
  // TODO: return diamond object as JSON
});

export default router;
