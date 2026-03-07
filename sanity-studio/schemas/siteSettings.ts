import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton: prevent creating multiple instances via the __experimental_actions option
  // or by checking for existing documents in the studio structure
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Main tagline displayed on the site',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'aboutText',
      title: 'About Text',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text content for the About section',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({ name: 'phone', title: 'Phone Number', type: 'string' }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
        defineField({ name: 'facebook', title: 'Facebook', type: 'url' }),
        defineField({ name: 'yelp', title: 'Yelp', type: 'url' }),
        defineField({ name: 'streetFoodFinder', title: 'Street Food Finder', type: 'url' }),
      ],
    }),
    defineField({
      name: 'nextEventName',
      title: 'Next Event Name',
      type: 'string',
      description: 'Name of the next upcoming event (highlighted on homepage)',
    }),
    defineField({ name: 'nextEventDate', title: 'Next Event Date', type: 'datetime' }),
    defineField({ name: 'nextEventLocation', title: 'Next Event Location', type: 'string' }),
    defineField({ name: 'nextEventAddress', title: 'Next Event Address', type: 'string' }),
    defineField({
      name: 'nextEventMapUrl',
      title: 'Next Event Map URL',
      type: 'url',
      description: 'Google Maps or similar link for the next event',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' };
    },
  },
});
