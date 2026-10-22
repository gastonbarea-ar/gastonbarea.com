export type BlogCategory = 
  | 'Innovación & Negocios'
  | 'Operaciones con IA'
  | 'Modern Tech Stack'
  | 'Infraestructura & Linux';

export type MediaBlockType = 
  | 'paragraph'
  | 'heading'
  | 'youtube'
  | 'spotify'
  | 'audio'
  | 'image'
  | 'callout'
  | 'quote'
  | 'code';

export interface BaseMediaBlock {
  id: string;
  type: MediaBlockType;
}

export interface ParagraphBlock extends BaseMediaBlock {
  type: 'paragraph';
  content: string;
}

export interface HeadingBlock extends BaseMediaBlock {
  type: 'heading';
  level: 2 | 3;
  text: string;
}

export interface YouTubeBlock extends BaseMediaBlock {
  type: 'youtube';
  videoIdOrUrl: string;
  caption?: string;
}

export interface SpotifyBlock extends BaseMediaBlock {
  type: 'spotify';
  spotifyUrlOrUri: string;
  caption?: string;
}

export interface AudioBlock extends BaseMediaBlock {
  type: 'audio';
  audioUrl: string;
  title: string;
  duration?: string;
  caption?: string;
}

export interface ImageBlock extends BaseMediaBlock {
  type: 'image';
  imageUrl: string;
  caption?: string;
  alt?: string;
}

export interface CalloutBlock extends BaseMediaBlock {
  type: 'callout';
  title: string;
  content: string;
  tone?: 'info' | 'highlight' | 'warning';
}

export interface QuoteBlock extends BaseMediaBlock {
  type: 'quote';
  quote: string;
  author?: string;
}

export interface CodeBlock extends BaseMediaBlock {
  type: 'code';
  language: string;
  code: string;
}

export type MediaBlock = 
  | ParagraphBlock
  | HeadingBlock
  | YouTubeBlock
  | SpotifyBlock
  | AudioBlock
  | ImageBlock
  | CalloutBlock
  | QuoteBlock
  | CodeBlock;

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  coverImage?: string;
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  blocks: MediaBlock[];
  tags: string[];
}
