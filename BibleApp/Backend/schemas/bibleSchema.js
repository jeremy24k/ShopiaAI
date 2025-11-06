import { z } from 'zod';

export const TranslationSchema = z.string().min(2, 'the translation must be at least 2 characters long');
export const BookSchema = z.string().min(1, 'the book is required');
export const ChapterSchema = z.string().min(1, 'the chapter is required');
export const CommentarySchema = z.string().min(2, 'the commentary must be at least 2 characters long');
export const ProfileSchema = z.string().min(1, 'the profile is required');

export const BooksParamsSchema = z.object({
  translation: TranslationSchema
});

export const ChapterParamsSchema = z.object({
  translation: TranslationSchema,
  book: BookSchema,
  chapter: ChapterSchema
});

export const CommentaryBooksParamsSchema = z.object({
  commentary: CommentarySchema
});

export const CommentaryChapterParamsSchema = z.object({
  commentary: CommentarySchema,
  book: BookSchema,
  chapter: ChapterSchema
});

export const CommentaryProfileParamsSchema = z.object({
  commentary: CommentarySchema,
  profile: ProfileSchema
});