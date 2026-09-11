import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import cloudinary from '../src/config/cloudinary.js';
import User from '../src/models/User.js';
import MenuItem from '../src/models/MenuItem.js';
import Order from '../src/models/Order.js';

const SEED_FOLDER = 'tastybites/seed';
const USER_AGENT = 'TastyBites-seed/1.0 (educational project)';

const menuItems = [
  {
    slug: 'truffle-arancini',
    imageQuery: 'arancini',
    name: 'Truffle Arancini',
    description: 'Crisp risotto balls with black truffle and parmesan, served with garlic aioli.',
    category: 'Starter',
    price: 349,
    availability: true,
  },
  {
    slug: 'charred-corn-chowder',
    imageQuery: 'corn chowder',
    name: 'Charred Corn Chowder',
    description: 'Smoky sweet corn chowder finished with chives and crispy shallots.',
    category: 'Starter',
    price: 249,
    availability: true,
  },
  {
    slug: 'burrata-heirloom-tomato',
    imageQuery: 'burrata tomato',
    name: 'Burrata & Heirloom Tomato',
    description: 'Creamy burrata over heirloom tomatoes with basil oil, sea salt and toasted sourdough.',
    category: 'Starter',
    price: 429,
    availability: true,
  },
  {
    slug: 'herb-roasted-chicken',
    imageQuery: 'roast chicken',
    name: 'Herb Roasted Chicken',
    description: 'Free-range half chicken with rosemary jus, served over root vegetable mash.',
    category: 'Main Course',
    price: 649,
    availability: true,
  },
  {
    slug: 'wild-mushroom-risotto',
    imageQuery: 'mushroom risotto',
    name: 'Wild Mushroom Risotto',
    description: 'Creamy arborio rice with a medley of wild mushrooms and aged pecorino.',
    category: 'Main Course',
    price: 549,
    availability: true,
  },
  {
    slug: 'pan-seared-salmon',
    imageQuery: 'salmon fillet plate',
    name: 'Pan-Seared Salmon',
    description: 'Crispy skin salmon with lemon beurre blanc and charred asparagus.',
    category: 'Main Course',
    price: 899,
    availability: false,
  },
  {
    slug: 'molten-chocolate-cake',
    imageQuery: 'chocolate lava cake',
    name: 'Molten Chocolate Cake',
    description: 'Warm dark chocolate cake with a liquid center, served with vanilla bean ice cream.',
    category: 'Dessert',
    price: 299,
    availability: true,
  },
  {
    slug: 'classic-tiramisu',
    imageQuery: 'tiramisu',
    name: 'Classic Tiramisu',
    description: 'Espresso-soaked ladyfingers layered with mascarpone cream and cocoa.',
    category: 'Dessert',
    price: 329,
    availability: true,
  },
  {
    slug: 'baked-blueberry-cheesecake',
    imageQuery: 'blueberry cheesecake',
    name: 'Baked Blueberry Cheesecake',
    description: 'New York style baked cheesecake on a buttery biscuit base, topped with blueberry compote.',
    category: 'Dessert',
    price: 349,
    availability: true,
  },
  {
    slug: 'watermelon-cooler',
    imageQuery: 'watermelon juice',
    name: 'Fresh Watermelon Cooler',
    description: 'Chilled watermelon juice with mint and a splash of lime.',
    category: 'Beverage',
    price: 179,
    availability: true,
  },
  {
    slug: 'house-cold-brew',
    imageQuery: 'File:Homemade Cold Coffee(Indian Style)- Kolkata.jpg',
    name: 'House Cold Brew',
    description: 'Slow-steeped cold brew coffee served over ice.',
    category: 'Beverage',
    price: 199,
    availability: true,
  },
  {
    slug: 'alphonso-mango-lassi',
    imageQuery: 'mango lassi',
    name: 'Alphonso Mango Lassi',
    description: 'Thick chilled yoghurt blended with Alphonso mango and a pinch of cardamom.',
    category: 'Beverage',
    price: 169,
    availability: true,
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findPhotoUrls = async (query) => {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  const lookup = query.startsWith('File:')
    ? { titles: query }
    : { generator: 'search', gsrsearch: `${query} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '6' };

  url.search = new URLSearchParams({
    action: 'query',
    ...lookup,
    prop: 'imageinfo',
    iiprop: 'url|mime',
    iiurlwidth: '960',
    format: 'json',
  }).toString();

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  const data = await res.json();

  return Object.values(data.query?.pages || {})
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((page) => page.imageinfo?.[0])
    .filter((info) => info?.thumburl && info.thumbwidth >= 500 && ['image/jpeg', 'image/png'].includes(info.mime))
    .map((info) => info.thumburl);
};

const uploadBuffer = (buffer, publicId) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ public_id: publicId, overwrite: true, resource_type: 'image' }, (err, result) =>
        err ? reject(err) : resolve(result)
      )
      .end(buffer);
  });

const findExisting = async (publicId) => {
  try {
    return await cloudinary.api.resource(publicId);
  } catch {
    return null;
  }
};

const downloadImage = async (url) => {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.status === 429) {
      await sleep(3000 * attempt);
      continue;
    }
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) return null;
    return Buffer.from(await res.arrayBuffer());
  }
  return null;
};

const getDishPhoto = async ({ slug, imageQuery }) => {
  const publicId = `${SEED_FOLDER}/${slug}`;

  const existing = await findExisting(publicId);
  if (existing) return { image: existing.secure_url, imagePublicId: publicId };

  for (const url of await findPhotoUrls(imageQuery)) {
    const buffer = await downloadImage(url);
    if (!buffer) continue;

    const result = await uploadBuffer(buffer, publicId);
    return { image: result.secure_url, imagePublicId: publicId };
  }

  throw new Error(`Could not fetch a photo for ${slug}`);
};

const run = async () => {
  await connectDB();

  const photos = [];
  for (const item of menuItems) {
    photos.push(await getDishPhoto(item));
    console.log(`Photo ready: ${item.name}`);
  }

  const oldItems = await MenuItem.find().select('+imagePublicId');
  await Promise.all(
    oldItems
      .filter((item) => item.imagePublicId && !item.imagePublicId.startsWith(SEED_FOLDER))
      .map((item) => cloudinary.uploader.destroy(item.imagePublicId).catch(() => {}))
  );

  await Order.deleteMany({});
  await User.deleteMany({});
  await MenuItem.deleteMany({});

  await User.create({
    name: 'Restaurant Admin',
    email: 'admin@tastybites.com',
    password: 'Admin@123',
    role: 'admin',
  });

  await MenuItem.insertMany(menuItems.map(({ slug, imageQuery, ...item }, i) => ({ ...item, ...photos[i] })));

  console.log(`Seed complete: 1 admin user and ${menuItems.length} menu items created`);
  console.log('Admin login -> email: admin@tastybites.com | password: Admin@123');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
