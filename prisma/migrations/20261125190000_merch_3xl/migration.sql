-- Merch: sell every T-shirt design in 3XL too, listed after the largest size it has.
INSERT INTO "product_variant" ("id", "productId", "design", "size", "sortOrder")
SELECT 'pv_' || md5(random()::text || clock_timestamp()::text || v."design"), v."productId", v."design", '3XL', MAX(v."sortOrder") + 1
FROM "product_variant" v
JOIN "product" p ON p."id" = v."productId" AND p."slug" = 'traders-dept-tee'
GROUP BY v."productId", v."design"
ON CONFLICT DO NOTHING;
