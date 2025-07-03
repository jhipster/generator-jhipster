import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'blog',
    data: { pageTitle: 'blogApp.blogBlog.home.title' },
    loadChildren: () => import('./blog/blog/blog.routes'),
  },
  {
    path: 'post',
    data: { pageTitle: 'blogApp.blogPost.home.title' },
    loadChildren: () => import('./blog/post/post.routes'),
  },
  {
    path: 'tag',
    data: { pageTitle: 'blogApp.blogTag.home.title' },
    loadChildren: () => import('./blog/tag/tag.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
