export default {
  name: 'bundle',
  title: 'Training Bundles',
  type: 'document',
  fields: [
    { name: 'title', title: 'Bundle Title', type: 'string' },
    { name: 'daysPerWeek', title: 'Days Per Week (e.g., 2, 3, 5)', type: 'number' },
    { name: 'price', title: 'Price ($)', type: 'number' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'image', title: 'Bundle Image', type: 'image', options: { hotspot: true } },
  ],
};