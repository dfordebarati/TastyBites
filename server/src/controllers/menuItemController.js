import MenuItem, { CATEGORIES } from '../models/MenuItem.js';
import ApiError from '../utils/ApiError.js';
import { saveImage, deleteImage } from '../utils/imageStorage.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toBoolean = (value) => value === true || value === 'true';

export const listMenuItems = async (req, res) => {
  const { category, search } = req.query;
  const filter = {};

  if (typeof category === 'string' && category) filter.category = category;
  if (typeof search === 'string' && search.trim()) {
    filter.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
  }

  const items = await MenuItem.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: items.length, items });
};

export const getCategories = async (_req, res) => {
  res.json({ success: true, categories: CATEGORIES });
};

export const getMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw ApiError.notFound('Menu item not found');
  res.json({ success: true, item });
};

export const createMenuItem = async (req, res) => {
  const { name, description, category, price, availability } = req.body ?? {};

  if (!name || !description || !category || price === undefined || price === '') {
    throw ApiError.badRequest('Name, description, category and price are required');
  }

  const item = new MenuItem({
    name,
    description,
    category,
    price,
    availability: availability === undefined ? true : toBoolean(availability),
    createdBy: req.user._id,
  });
  await item.validate();

  const { url, publicId } = await saveImage(req.file);
  item.image = url;
  item.imagePublicId = publicId;
  await item.save();

  res.status(201).json({ success: true, item });
};

export const updateMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id).select('+imagePublicId');
  if (!item) throw ApiError.notFound('Menu item not found');

  const { name, description, category, price, availability } = req.body ?? {};

  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (category !== undefined) item.category = category;
  if (price !== undefined) item.price = price;
  if (availability !== undefined) item.availability = toBoolean(availability);
  await item.validate();

  if (req.file) {
    const oldPublicId = item.imagePublicId;
    const { url, publicId } = await saveImage(req.file);
    item.image = url;
    item.imagePublicId = publicId;
    await deleteImage(oldPublicId);
  }

  await item.save();
  res.json({ success: true, item });
};

export const deleteMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id).select('+imagePublicId');
  if (!item) throw ApiError.notFound('Menu item not found');

  await item.deleteOne();
  await deleteImage(item.imagePublicId);

  res.json({ success: true, message: 'Menu item deleted' });
};
