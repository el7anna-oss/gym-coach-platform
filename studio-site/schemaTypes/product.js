export default {
  name: 'product',
  title: 'Shop Products',
  type: 'document',
  fields: [
    { name: 'name', title: 'Product Name', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'price', title: 'Price ($)', type: 'number' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'image', title: 'Product Image', type: 'image', options: { hotspot: true } },
  ],
};