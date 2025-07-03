import NavbarItem from 'app/layouts/navbar/navbar-item.model';

export const EntityNavbarItems: NavbarItem[] = [
  {
    name: 'Blog',
    route: '/blog/blog',
    translationKey: 'global.menu.entities.blogBlog',
  },
  {
    name: 'Post',
    route: '/blog/post',
    translationKey: 'global.menu.entities.blogPost',
  },
  {
    name: 'Tag',
    route: '/blog/tag',
    translationKey: 'global.menu.entities.blogTag',
  },
];
