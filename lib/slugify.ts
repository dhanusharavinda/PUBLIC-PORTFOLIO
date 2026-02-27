export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

export function generateUniqueUsername(
  fullName: string,
  existingUsernames: string[] = []
): string {
  let baseSlug = slugify(fullName);
  let username = baseSlug;
  let counter = 1;

  while (existingUsernames.includes(username)) {
    const randomSuffix = Math.floor(Math.random() * 900) + 100; // 100-999
    username = `${baseSlug}-${randomSuffix}`;
    counter++;

    // Prevent infinite loop
    if (counter > 100) {
      username = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return username;
}
