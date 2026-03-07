export interface FoodEstablishmentData {
  name: string;
  description: string;
  url: string;
  phone?: string;
  email?: string;
  image?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  servesCuisine?: string[];
  priceRange?: string;
  rating?: { value: number; count: number };
}

export function generateFoodEstablishment(data: FoodEstablishmentData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: data.name,
    description: data.description,
    url: data.url,
    telephone: data.phone,
    email: data.email,
    image: data.image,
    address: data.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: data.address.street,
          addressLocality: data.address.city,
          addressRegion: data.address.state,
          postalCode: data.address.zip,
          addressCountry: 'US',
        }
      : undefined,
    servesCuisine: data.servesCuisine,
    priceRange: data.priceRange,
    aggregateRating: data.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: data.rating.value,
          reviewCount: data.rating.count,
        }
      : undefined,
  };
}

export interface MenuItemData {
  name: string;
  description: string;
  image?: string;
  price?: number;
}

export function generateMenuItems(items: MenuItemData[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    hasMenuSection: {
      '@type': 'MenuSection',
      name: 'Gourmet Sliders',
      hasMenuItem: items.map((item) => ({
        '@type': 'MenuItem',
        name: item.name,
        description: item.description,
        image: item.image,
        offers: item.price
          ? {
              '@type': 'Offer',
              price: item.price,
              priceCurrency: 'USD',
            }
          : undefined,
      })),
    },
  };
}

export function generateLocalBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Culinary JEMs',
    description: 'Chef-driven gourmet sliders and elevated comfort food. Available for pop-ups, private parties, corporate events, and catering across the East Valley, AZ.',
    url: 'https://culinaryjems.com',
    telephone: '',
    email: 'culinaryjems@gmail.com',
    image: 'https://culinaryjems.com/assets/imported/logo.png',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gilbert',
      addressRegion: 'AZ',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.3528,
      longitude: -111.7890,
    },
    servesCuisine: ['American', 'Gourmet Sliders', 'Comfort Food'],
    priceRange: '$',
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'FoodService',
          name: 'Event Catering',
          description: 'Custom catering for corporate events, private parties, weddings, brewery events, and community gatherings.',
        },
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.0,
      reviewCount: 241,
      bestRating: 5,
    },
    sameAs: [
      'https://www.instagram.com/culinaryjems/',
      'https://www.facebook.com/culinaryjems/',
      'https://www.yelp.com/biz/culinary-jems-gilbert',
    ],
  };
}

export interface EventData {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  description?: string;
}

export function generateEvent(event: EventData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEvent',
    name: event.name,
    startDate: `${event.date}T${event.startTime}`,
    endDate: `${event.date}T${event.endTime}`,
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.address,
        addressLocality: event.city,
        addressRegion: 'AZ',
        addressCountry: 'US',
      },
    },
    description: event.description || `Culinary JEMs gourmet slider pop-up at ${event.venue}`,
    organizer: {
      '@type': 'FoodEstablishment',
      name: 'Culinary JEMs',
      url: 'https://culinaryjems.com',
    },
  };
}
