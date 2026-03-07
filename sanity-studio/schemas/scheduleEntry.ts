import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'scheduleEntry',
  title: 'Schedule Entry',
  type: 'document',
  fields: [
    defineField({
      name: 'eventName',
      title: 'Event Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'startTime', title: 'Start Time', type: 'string', description: 'e.g. 11:00 AM' }),
    defineField({ name: 'endTime', title: 'End Time', type: 'string', description: 'e.g. 3:00 PM' }),
    defineField({ name: 'venueName', title: 'Venue Name', type: 'string' }),
    defineField({ name: 'address', title: 'Address', type: 'string' }),
    defineField({ name: 'city', title: 'City', type: 'string' }),
    defineField({
      name: 'mapUrl',
      title: 'Map URL',
      type: 'url',
      description: 'Google Maps or similar link',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
  ],
  orderings: [{ title: 'Date', name: 'date', by: [{ field: 'date', direction: 'asc' }] }],
  preview: {
    select: { title: 'eventName', subtitle: 'date' },
  },
});
