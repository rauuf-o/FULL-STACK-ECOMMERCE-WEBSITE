"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Product } from "@/types";
import { productFormSchema } from "@/lib/validators";
import { productDefaultValues } from "@/lib/constants";
import { Upload, X, Loader2 } from "lucide-react";
import { createProduct, updateProduct } from "@/actions/products.action";

type ProductFormProps = {
  type: "Create" | "Update";
  product?: Product;
};

type ProductFormValues = z.infer<typeof productFormSchema>;

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["39", "40", "41", "42", "43", "44", "45"];

const ProductForm = ({ type, product }: ProductFormProps) => {
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState<string[]>(
    product?.images || [],
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    product?.banner || null,
  );
  const [uploading, setUploading] = useState(false);

  const defaultValues =
    type === "Update" && product ? product : productDefaultValues;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProductFormValues>({ defaultValues });

  const watchImages = watch("images");
  const watchTailles = watch("taille") || [];

  const isShoeProduct =
    watch("category")?.toLowerCase().includes("chaussures") || false;
  const availableSizes = isShoeProduct ? SHOE_SIZES : CLOTHING_SIZES;

  // ✅ NEW: Upload images to Vercel Blob
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);

    try {
      const fileArray = Array.from(files);

      // Upload each file to Vercel Blob
      const uploadPromises = fileArray.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const { url } = await response.json();
        return url;
      });

      const newImageUrls = await Promise.all(uploadPromises);

      setImagePreview((prev) => [...prev, ...newImageUrls]);
      setValue("images", [...(watchImages || []), ...newImageUrls], {
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = imagePreview.filter((_, i) => i !== index);
    setImagePreview(updated);
    setValue("images", updated);
  };

  // ✅ NEW: Upload banner to Vercel Blob
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();
      setBannerPreview(url);
      setValue("banner", url);
    } catch (error) {
      console.error("Error uploading banner:", error);
      alert("Failed to upload banner. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeBanner = () => {
    setBannerPreview(null);
    setValue("banner", null);
  };

  // ---------------- SUBMIT ----------------
  const onSubmit = async (data: ProductFormValues) => {
    try {
      let res;
      if (type === "Create") {
        res = await createProduct(data);
      } else {
        if (!product?.id) return;
        res = await updateProduct({ ...data, id: product.id });
      }

      if (res.success) {
        router.push("/admin/products");
      } else {
        alert(res.message);
      }
    } catch {
      alert("Unexpected error");
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 text-foreground">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl border border-border bg-card p-10 shadow-xl">
          {/* HEADER */}
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-primary">
              {type === "Create" ? "Create Product" : "Update Product"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Manage your product details and assets
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* BASIC INFO */}
            <section className="rounded-2xl border border-border bg-background p-6 space-y-6">
              <h3 className="text-lg font-semibold text-primary">
                Basic Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {["name", "slug", "category", "brand"].map((field) => (
                  <div
                    key={field}
                    className={field === "name" ? "md:col-span-2" : ""}
                  >
                    <label className="text-sm font-medium text-muted-foreground">
                      {field}
                    </label>
                    <input
                      {...register(field as keyof ProductFormValues)}
                      className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm
                      text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3
                    focus:border-primary focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Stock
                  </label>
                  <input
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3
                    focus:border-primary focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    {...register("description")}
                    className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 resize-none
                    focus:border-primary focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* TAILLES */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Available Sizes
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {availableSizes.map((size) => (
                      <label
                        key={size}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={size}
                          checked={watchTailles.includes(size)}
                          onChange={(e) => {
                            const current = watchTailles || [];
                            if (e.target.checked) {
                              setValue("taille", [...current, size]);
                            } else {
                              setValue(
                                "taille",
                                current.filter((t: string) => t !== size),
                              );
                            }
                          }}
                          className="h-5 w-5 accent-primary"
                        />
                        <span className="text-sm font-medium text-foreground">
                          {size}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* IMAGES */}
            <section className="rounded-2xl border border-border bg-background p-6 space-y-6">
              <h3 className="text-lg font-semibold text-primary">
                Product Images
              </h3>

              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center hover:border-primary transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="product-images"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label htmlFor="product-images" className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="mx-auto mb-3 text-primary animate-spin" />
                  ) : (
                    <Upload className="mx-auto mb-3 text-primary" />
                  )}
                  <p className="font-medium">
                    {uploading ? "Uploading..." : "Upload product images"}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
                        alt={`Product ${i + 1}`}
                        className="h-32 w-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full
                        opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* FEATURED */}
            <label className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 cursor-pointer hover:border-primary transition">
              <div>
                <p className="font-medium">Featured Product</p>
                <p className="text-xs text-muted-foreground">
                  Highlight on homepage
                </p>
              </div>
              <input
                type="checkbox"
                {...register("isFeatured")}
                className="h-5 w-5 accent-primary"
              />
            </label>

            {/* ACTIONS */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={uploading || isSubmitting}
                className="flex-1 rounded-xl border border-border px-6 py-3 text-sm
                text-muted-foreground hover:text-foreground hover:border-primary transition
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="flex-1 rounded-xl bg-primary px-6 py-3 text-sm font-bold
                text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Processing..."
                  : uploading
                    ? "Uploading..."
                    : `${type} Product`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
