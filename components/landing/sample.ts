import type { PortfolioWithProjects } from '@/types/portfolio';
import type { EditorialProject } from '@/components/portfolio/EditorialPortfolio';

export const sampleCreator = {
  name: 'Nora Chen',
  role: 'Visual identity & editorial design',
};

export const sampleProjects = [
  {
    id: 'high-water',
    name: 'High Water',
    kind: 'Editorial design',
    description: 'A concept for a journal about landscapes shaped by ice. The wide margins and small captions give each photograph room to set the pace.',
    image: '/landing/high-water.webp',
    alt: 'A glacier winds between steep, dark mountain ridges.',
    credit: 'Artem Korolev',
    source: 'https://unsplash.com/photos/glacier-between-steep-mountain-ridges-fdV4WAlaldw',
  },
  {
    id: 'common-ground',
    name: 'Common Ground',
    kind: 'Visual identity',
    description: 'An identity for an imagined architecture exhibition. A modular letter grid borrows the rhythm of the concrete façades on display.',
    image: '/landing/common-ground.webp',
    alt: 'A concrete façade repeats a grid of deeply recessed windows.',
    credit: 'Marc Cordeau',
    source: 'https://unsplash.com/photos/concrete-building-facade-with-repetitive-window-patterns-RTZHabQALJo',
  },
  {
    id: 'soundings',
    name: 'Soundings',
    kind: 'Publication design',
    description: 'A cover study for a collection of short essays about the coast. The title follows the edge of the surf, leaving the dark sand open.',
    image: '/landing/soundings.webp',
    alt: 'White surf meets black sand at Reynisfjara in Iceland.',
    credit: 'Bernd Dittrich',
    source: 'https://unsplash.com/photos/a-black-and-white-photo-of-the-ocean-waves-HJrBa4MaQO4',
  },
] as const;


export const samplePortfolio: PortfolioWithProjects & { projects: EditorialProject[] } = {
  username: 'nora-chen',
  full_name: sampleCreator.name,
  job_title: sampleCreator.role,
  tagline: 'Visual studies shaped by the places they depict.',
  location: '',
  bio: '',
  email: '',
  profile_photo_url: '',
  availability_status: 'not_looking',
  open_to_work: false,
  skills: [],
  template: 'minimal',
  is_public: true,
  view_count: 0,
  experiences: [],
  projects: sampleProjects.map((project, index) => ({
    id: project.id,
    name: project.name,
    label: project.kind,
    cover_image_url: project.image,
    coverAlt: project.alt,
    coverTitle: project.id === 'high-water' ? 'HIGH WATER' : project.name,
    photoCredit: { name: project.credit, href: project.source },
    carousel_images: [],
    description: project.description,
    tech_stack: [],
    github_url: '',
    is_featured: index === 0,
    order_index: index,
  })),
};
