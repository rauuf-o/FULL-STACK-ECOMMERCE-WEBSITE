export const dynamic = "force-dynamic"; // ✅ No caching

import React from "react";
import ProductForm from "@/components/admin/product-form";

const CreateProductPafe = () => {
  return (
    <div>
      <ProductForm type="Create" />
    </div>
  );
};

export default CreateProductPafe;
