import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'eventType', title: 'Event Type', type: 'string' }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Yelp', value: 'yelp' },
          { title: 'Google', value: 'google' },
          { title: 'Direct', value: 'direct' },
          { title: 'Facebook', value: 'facebook' },
        ],
      },
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5).integer(),
    }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'customerName', subtitle: 'source' },
  },
});
