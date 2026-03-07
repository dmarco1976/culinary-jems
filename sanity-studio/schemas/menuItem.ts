import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Slider Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 } }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({
      name: 'protein',
      title: 'Protein Type',
      type: 'string',
      options: {
        list: [
          { title: 'Beef', value: 'beef' },
          { title: 'Pork', value: 'pork' },
          { title: 'Chicken', value: 'chicken' },
          { title: 'Turkey', value: 'turkey' },
          { title: 'Vegetarian', value: 'vegetarian' },
        ],
      },
    }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'price', title: 'Price', type: 'number' }),
    defineField({ name: 'available', title: 'Available', type: 'boolean', initialValue: true }),
    defineField({ name: 'featured', title: 'Featured on Homepage', type: 'boolean', initialValue: false }),
    defineField({ name: 'displayOrder', title: 'Display Order', type: 'number' }),
  ],
  orderings: [{ title: 'Display Order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'protein', media: 'photo' },
  },
});
