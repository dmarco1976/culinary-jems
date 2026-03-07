export const menuItemsQuery = `*[_type == "menuItem" && available == true] | order(displayOrder asc) {
  _id,
  name,
  "slug": slug.current,
  description,
  protein,
  photo,
  price,
  featured,
  displayOrder
}`;

export const featuredMenuItemsQuery = `*[_type == "menuItem" && available == true && featured == true] | order(displayOrder asc) {
  _id,
  name,
  "slug": slug.current,
  description,
  protein,
  photo,
  price
}`;

export const menuItemsByProteinQuery = `*[_type == "menuItem" && available == true && protein == $protein] | order(displayOrder asc) {
  _id, name, "slug": slug.current, description, protein, photo, price, featured, displayOrder
}`;

export const galleryPhotosQuery = `*[_type == "galleryPhoto"] | order(displayOrder asc) {
  _id,
  image,
  caption,
  category,
  alt
}`;

export const galleryPhotosByCategoryQuery = `*[_type == "galleryPhoto" && category == $category] | order(displayOrder asc) {
  _id, image, caption, category, alt
}`;

export const testimonialsQuery = `*[_type == "testimonial" && featured == true] {
  _id,
  customerName,
  quote,
  eventType,
  source,
  rating
}`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  tagline,
  heroImage,
  aboutText,
  contactEmail,
  phone,
  socialLinks,
  nextEventName,
  nextEventDate,
  nextEventLocation,
  nextEventAddress,
  nextEventMapUrl
}`;

export const upcomingScheduleQuery = `*[_type == "scheduleEntry" && date >= now()] | order(date asc) {
  _id,
  eventName,
  date,
  startTime,
  endTime,
  venueName,
  address,
  city,
  mapUrl,
  description,
  featured
}`;

export const nextEventQuery = `*[_type == "scheduleEntry" && date >= now()] | order(date asc) [0] {
  _id,
  eventName,
  date,
  startTime,
  endTime,
  venueName,
  address,
  city,
  mapUrl
}`;
