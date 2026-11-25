-- Merch: several T-shirt designs, each sold in the same sizes.
-- Existing variants (and the orders that point at them) are the black goat tee.

-- AlterTable
ALTER TABLE "product_variant" ADD COLUMN "design" TEXT NOT NULL DEFAULT 'goat-black';

-- DropIndex
DROP INDEX "product_variant_productId_size_key";

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_productId_design_size_key" ON "product_variant"("productId", "design", "size");

-- Give the shop's T-shirt the new designs in the sizes it already has.
INSERT INTO "product_variant" ("id", "productId", "design", "size", "sortOrder")
SELECT 'pv_' || md5(random()::text || clock_timestamp()::text), v."productId", d.design, v."size", v."sortOrder"
FROM "product_variant" v
JOIN "product" p ON p."id" = v."productId" AND p."slug" = 'traders-dept-tee'
CROSS JOIN (VALUES ('goat-white'), ('money-black'), ('money-white'), ('eyes-white')) AS d(design)
WHERE v."design" = 'goat-black'
ON CONFLICT DO NOTHING;

-- The description was written for the black goat tee only.
UPDATE "product"
SET "description" = 'Million Goats-ын албан ёсны футболк. Урд талд лого, ар талд таны сонгосон загварын хэвлэл.',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'traders-dept-tee';
