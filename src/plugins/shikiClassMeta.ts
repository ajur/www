import type { ShikiTransformer } from 'shiki';

export const shikiClassMeta: ShikiTransformer = {
  name: 'shikiClassMeta',
  pre(node) {
    const meta = this.options.meta?.__raw?.split(' ').filter(Boolean) || [];
    const classes = meta
      .filter((part) => part.startsWith('.'))
      .map((part) => part.slice(1));
    node.properties.class = `${node.properties.class || ''} ${classes.join(' ')}`.trim();
  }
};