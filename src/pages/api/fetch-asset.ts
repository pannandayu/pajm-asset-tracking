import { query } from "@/util";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await query(`SELECT 
    d.*,
    JSON_AGG(
        CASE WHEN cmr.complementary_id IS NOT NULL THEN
            JSON_BUILD_OBJECT(
                'complementary_id', cmr.complementary_id,
                'relation', cmr.relation,
                'name', cm.name,
                'brand', cm.brand,
                'model', cm.model,
                'category', cm.category,
                'sub_category', cm.sub_category,
                'archive', cm.archive,
                'notes', cm.notes
            )
        ELSE NULL
        END
    ) FILTER (WHERE cmr.complementary_id IS NOT NULL) AS complementary_items,
    JSON_AGG(
        CASE WHEN cor.component_id IS NOT NULL THEN
            JSON_BUILD_OBJECT(
                'component_id', cor.component_id,
                'relation', cor.relation,
                'name', co.name,
                'brand', co.brand,
                'model', co.model,
                'archive', co.archive,
                'notes', co.notes
            )
        ELSE NULL
        END
    ) FILTER (WHERE cor.component_id IS NOT NULL) AS component_items
FROM 
    asset.data d
LEFT JOIN 
    asset.complementary_relation cmr ON d.id = cmr.parent_id
LEFT JOIN 
    asset.complementary cm ON cmr.complementary_id = cm.id  -- Fixed this line
LEFT JOIN 
    asset.component_relation cor ON d.id = cor.parent_id
LEFT JOIN 
    asset.component co ON cor.component_id = co.id
GROUP BY 
    d.id, d.name;
`);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
