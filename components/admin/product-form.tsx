"use client";
//THIS NEED A REWORK
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Product } from "@/types";
import { productFormSchema } from "@/lib/validators";
import { productDefaultValues } from "@/lib/constants";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { createProduct, updateProduct } from "@/actions/products.action";
import { UploadButton } from "@/lib/uploadthing";
type ProductFormProps = {
  type: "Create" | "Update";
  product?: Product;
};

type ProductFormValues = z.infer<typeof productFormSchema>;

const ProductForm = ({ type, product }: ProductFormProps) => {
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const defaultValues =
    type === "Update" && product ? product : productDefaultValues;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    defaultValues,
  });

  const watchImages = watch("images");

  /* -------------------- IMAGE UPLOAD -------------------- */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // Use Promises to wait for all files to be read
    const uploadPromises = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    const newImages = await Promise.all(uploadPromises);

    // Update local preview state
    setImagePreview((prev) => [...prev, ...newImages]);

    // Update React Hook Form state immediately with the full new list
    setValue("images", [...(watchImages || []), ...newImages], {
      shouldValidate: true, // This forces Zod to re-check the field
    });
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setBannerPreview(result);
      setValue("banner", result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const updated = imagePreview.filter((_, i) => i !== index);
    setImagePreview(updated);
    setValue("images", updated);
  };

  const removeBanner = () => {
    setBannerPreview(null);
    setValue("banner", null);
  };

  /* -------------------- SUBMIT -------------------- */
  const onSubmit = async (data: ProductFormValues) => {
    try {
      let res;

      if (type === "Create") {
        // For creation, we just send the form data
        res = await createProduct(data);
      } else {
        // For updates, we MUST have an ID.
        // We take the ID from the 'product' prop passed to the component.
        if (!product?.id) {
          alert("Error: Cannot update a product without an ID.");
          return;
        }
        res = await updateProduct({ ...data, id: product.id });
      }

      if (res.success) {
        alert(res.message);
        router.push("/admin/products");
      } else {
        alert(res.message);
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      alert("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-10">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              {type === "Create" ? "Create Product" : "Update Product"}
            </h2>
            <p className="text-gray-500 mt-2">
              Manage your product details and assets
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* ---------------- BASIC INFO ---------------- */}
            <section className="bg-gray-50 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { id: "name", label: "Product Name", type: "text" },
                  { id: "slug", label: "Slug", type: "text" },
                  { id: "category", label: "Category", type: "text" },
                  { id: "brand", label: "Brand", type: "text" },
                ].map(({ id, label, type }) => (
                  <div
                    key={id}
                    className={id === "name" ? "md:col-span-2" : ""}
                  >
                    <label className="text-sm font-medium">{label}</label>
                    <input
                      type={type}
                      {...register(id as any)}
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3
                      text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition"
                    />
                    {errors[id as keyof ProductFormValues] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[id as keyof ProductFormValues]?.message}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <label className="text-sm font-medium">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    className="mt-2 w-full rounded-xl border px-4 py-3 focus:ring-4 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <input
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    className="mt-2 w-full rounded-xl border px-4 py-3 focus:ring-4 focus:ring-blue-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    rows={5}
                    {...register("description")}
                    className="mt-2 w-full rounded-xl border px-4 py-3 resize-none focus:ring-4 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </section>

            {/* ---------------- IMAGES ---------------- */}
            <section className="bg-gray-50 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Product Images</h3>

              <div className="border border-dashed rounded-2xl p-8 text-center bg-white hover:bg-blue-50/30 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="product-images"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="product-images" className="cursor-pointer">
                  <Upload className="mx-auto mb-3 text-blue-600" />
                  <p className="font-medium">Upload product images</p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </label>
              </div>

              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreview.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img}
                        className="h-32 w-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ---------------- FEATURED ---------------- */}
            <label className="flex items-center justify-between p-5 rounded-2xl border bg-white hover:border-blue-500 transition cursor-pointer">
              <div>
                <p className="font-medium">Featured Product</p>
                <p className="text-xs text-gray-500">Highlight on homepage</p>
              </div>
              <input
                type="checkbox"
                {...register("isFeatured")}
                className="h-5 w-5 accent-blue-600"
              />
            </label>

            {/* ---------------- ACTIONS ---------------- */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-xl border px-6 py-3 text-sm font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                px-6 py-3 text-sm font-semibold text-white
                shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 transition"
              >
                {isSubmitting ? "Processing..." : `${type} Product`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
