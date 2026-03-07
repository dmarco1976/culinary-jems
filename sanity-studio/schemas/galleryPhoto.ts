import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'galleryPhoto',
  title: 'Gallery Photo',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Food', value: 'food' },
          { title: 'Events', value: 'events' },
          { title: 'Truck', value: 'truck' },
          { title: 'Catering', value: 'catering' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'displayOrder', title: 'Display Order', type: 'number' }),
    defineField({ name: 'alt', title: 'Alt Text', type: 'string', description: 'Accessibility text describing the image' }),
  ],
  orderings: [{ title: 'Display Order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: {
    select: { title: 'caption', subtitle: 'category', media: 'image' },
  },
});
