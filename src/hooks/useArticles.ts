import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  category_slug: string;
  author: string | null;
  author_role: string | null;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  views: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  category_slug: string;
  author: string;
  author_role: string;
  image_url: string;
  source_name: string;
  source_url: string;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now();
};

const generateId = (): string => {
  return 'manual-' + crypto.randomUUID();
};

export function useAdminArticles() {
  return useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Article;
    },
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ArticleFormData) => {
      const article = {
        id: generateId(),
        slug: generateSlug(formData.title),
        title: formData.title,
        excerpt: formData.excerpt || null,
        content: formData.content || null,
        category: formData.category,
        category_slug: formData.category_slug,
        author: formData.author || null,
        author_role: formData.author_role || 'Correspondent',
        image_url: formData.image_url || null,
        source_name: formData.source_name || null,
        source_url: formData.source_url || null,
        published_at: new Date().toISOString(),
        views: '0',
      };

      const { data, error } = await supabase
        .from('articles')
        .insert(article)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Article created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create article: ${error.message}`);
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<ArticleFormData> }) => {
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: formData.title,
          excerpt: formData.excerpt || null,
          content: formData.content || null,
          category: formData.category,
          category_slug: formData.category_slug,
          author: formData.author || null,
          author_role: formData.author_role || 'Correspondent',
          image_url: formData.image_url || null,
          source_name: formData.source_name || null,
          source_url: formData.source_url || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Article updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update article: ${error.message}`);
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Article deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete article: ${error.message}`);
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload image: ${error.message}`);
    },
  });
}
