"use client";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
const ProductImages = ({ images }: { images: string[] }) => {
  const [selectedImage, setSelectedImage] = useState<string>(images[0]);
  return (
    <div className="space-y-4">
      <Image
        src={selectedImage}
        alt="Product Image"
        width={500}
        height={500}
        className="object-center object-cover"
      />
      <div className="flex justify-center gap-2">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`Product Image ${index + 1}`}
            width={100}
            height={100}
            className={cn(
              "object-center object-cover cursor-pointer border-gray-400 hover:border-black border-2 p-1 rounded-md",
              selectedImage === image ? "border-black" : "border-gray-400"
            )}
            onClick={() => setSelectedImage(image)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
