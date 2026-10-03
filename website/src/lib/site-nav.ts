export const sectionLinks = [
  'Events',
  'Awareness',
] as const;

export const routeLinks = [
  { label: 'About Us', path: '/about' },
] as const;


export const toSectionId = (label: string) => label.toLowerCase().replace(/\s/g, '-');
