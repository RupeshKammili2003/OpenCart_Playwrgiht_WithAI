import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'node:path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

type Product = {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating?: { rate: number; count: number };
};

type ProductPayload = Omit<Product, 'id' | 'rating'>;

test.describe('Fake Store Products API Tests', () => {
    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);
    const productSchema = DataProvider.readJson(
        path.join(process.cwd(), 'api', 'schemas', 'product_api_schema.json'),
    );

    test('GET - All Products @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
        expect(response.status(), 'Products endpoint returns 200').toBe(200);
        const products = (await response.json()) as Product[];

        expect(Array.isArray(products), 'The response is an array').toBeTruthy();
        expect(products.length, 'At least one product is returned').toBeGreaterThan(0);
        for (const product of products) {
            expect(product.id).toEqual(expect.any(Number));
            expect(product.title).toEqual(expect.any(String));
            expect(product.price).toEqual(expect.any(Number));
            expect(product.category).toEqual(expect.any(String));
            expect(product.image).toEqual(expect.any(String));
        }
    });

    test('GET - Product by ID @master @sanity @api', async ({ request }) => {
        const response = await request.get(
            `${BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID))}`,
        );
        expect(response.status(), 'Product endpoint returns 200').toBe(200);
        const product = (await response.json()) as Product;

        expect(product.id).toBe(PRODUCT_ID);
        expect(product.title).toEqual(expect.any(String));
        expect(product.price).toEqual(expect.any(Number));
        expect(product.category).toEqual(expect.any(String));
        expect(product.image).toEqual(expect.any(String));
    });

    test('GET - Products with limit @master @regression @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(LIMIT));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const products = (await response.json()) as Product[];

        expect(Array.isArray(products)).toBeTruthy();
        expect(products).toHaveLength(LIMIT);
    });

    test('GET - Products sorted ascending @master @regression @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'asc');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const products = (await response.json()) as Product[];
        const ids = products.map((product) => product.id);

        expect(ids.length).toBeGreaterThan(0);
        expect(ids).toEqual([...ids].sort((first, second) => first - second));
    });

    test('GET - Products sorted descending @master @regression @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'desc');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const products = (await response.json()) as Product[];
        const ids = products.map((product) => product.id);

        expect(ids.length).toBeGreaterThan(0);
        expect(ids).toEqual([...ids].sort((first, second) => second - first));
    });

    test('GET - All Product Categories @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
        expect(response.status()).toBe(200);
        const categories = (await response.json()) as string[];

        expect(Array.isArray(categories)).toBeTruthy();
        expect(categories.length).toBeGreaterThan(0);
    });

    test('GET - Products by Category @master @regression @api', async ({ request }) => {
        const category = 'electronics';
        const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', encodeURIComponent(category));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const products = (await response.json()) as Product[];

        expect(Array.isArray(products)).toBeTruthy();
        expect(products.length).toBeGreaterThan(0);
        for (const product of products) {
            expect(product.category).toBe(category);
        }
    });

    test('POST - Create Product @master @regression @api', async ({ request }) => {
        const payload: ProductPayload = RandomDataUtil.generateProductPayload();
        const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });
        expect(response.status()).toBe(201);
        const created = (await response.json()) as Product;

        expect(created.id).toEqual(expect.any(Number));
        expect(created.title).toBe(payload.title);
        expect(created.price).toBe(payload.price);
        expect(created.description).toBe(payload.description);
        expect(created.image).toBe(payload.image);
        expect(created.category).toBe(payload.category);

        const deleteResponse = await request.delete(
            `${BASE_URL}${Routes.DELETE_PRODUCT.replace('{id}', String(created.id))}`,
        );
        expect(deleteResponse.status(), 'The created product cleanup succeeds').toBe(200);
    });

    test('PUT - Update Product @master @regression @api', async ({ request }) => {
        const payload: ProductPayload = RandomDataUtil.generateUpdatedProductPayload();
        const route = Routes.UPDATE_PRODUCT.replace('{id}', String(PRODUCT_ID));
        const response = await request.put(`${BASE_URL}${route}`, { data: payload });
        expect(response.status()).toBe(200);
        const updated = (await response.json()) as Product;

        expect(updated.id).toBe(PRODUCT_ID);
        expect(updated.title).toBe(payload.title);
        expect(updated.price).toBe(payload.price);
        expect(updated.description).toBe(payload.description);
        expect(updated.image).toBe(payload.image);
        expect(updated.category).toBe(payload.category);
    });

    test('DELETE - Product @master @regression @api', async ({ request }) => {
        const route = Routes.DELETE_PRODUCT.replace('{id}', String(PRODUCT_ID));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const deleted = (await response.json()) as Product;
        expect(deleted.id).toBe(PRODUCT_ID);
    });

    test('GET - Product response schema @master @regression @api', async ({ request }) => {
        const response = await request.get(
            `${BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID))}`,
        );
        expect(response.status()).toBe(200);

        const validator = new Ajv().compile(productSchema);
        const isValid = validator(await response.json());
        expect(isValid, `Product response schema errors: ${JSON.stringify(validator.errors)}`).toBeTruthy();
    });

    test('Product CRUD workflow @master @regression @end-to-end @api', async ({ request }) => {
        const payload: ProductPayload = RandomDataUtil.generateProductPayload();
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });
        expect(createResponse.status()).toBe(201);
        const created = (await createResponse.json()) as Product;
        expect(created.id).toEqual(expect.any(Number));

        const updatePayload: ProductPayload = RandomDataUtil.generateUpdatedProductPayload();
        const updateRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(created.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
        expect(updateResponse.status()).toBe(200);
        const updated = (await updateResponse.json()) as Product;
        expect(updated.id).toBe(created.id);
        expect(updated.title).toBe(updatePayload.title);

        const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(created.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status()).toBe(200);
    });
});
