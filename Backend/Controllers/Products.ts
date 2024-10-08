import ProductModel from "../Models/ProductModel";
import {
	createOne,
	deleteOne,
	getAll,
	getOne,
	updateOne,
} from "./refactorHandler";
import { Product } from "../interfaces/product";
import { uploadMultiImages } from "../Middleware/uploadImages";
import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import sharp from "sharp";

// Upload functions
export const uploadProductImages = uploadMultiImages([
	{ name: "cover", maxCount: 1 },
	{ name: "images", maxCount: 5 },
]);

export const resizeImages = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		if (req.files) {
			// Accessing cover image
			const cover = (req.files as any).cover?.[0]; // req.files.cover should be an array
			if (cover) {
				const coverName: string = `Product-${Date.now()}-cover.png`;
				await sharp(cover.buffer)
					.toFormat("png")
					.png({ quality: 95 })
					.toFile(`uploads/products/${coverName}`);
				req.body.cover = coverName;
			}

			// Accessing additional images
			const images = (req.files as any).images; // req.files.images should be an array
			if (images) {
				req.body.images = [];
				await Promise.all(
					images.map(async (img: any, index: number) => {
						const imageName: string = `Product-${Date.now()}N${index + 1}.png`;
						await sharp(img.buffer)
							.toFormat("png")
							.png({ quality: 95 })
							.toFile(`uploads/products/${imageName}`);
						req.body.images.push(imageName);
					})
				);
			}
		}
		next();
	}
);

// CRUD functions
export const createProduct = createOne<Product>(ProductModel);

export const getProducts = getAll<Product>(ProductModel, "Product");

export const getProduct = getOne<Product>(ProductModel, "reviews");

export const updateProduct = updateOne<Product>(ProductModel);

export const deleteProduct = deleteOne<Product>(ProductModel);
