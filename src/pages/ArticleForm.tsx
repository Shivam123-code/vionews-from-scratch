import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useArticle,
  useCreateArticle,
  useUpdateArticle,
  useUploadImage,
  ArticleFormData,
} from '@/hooks/useArticles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';

const CATEGORIES = [
  { label: 'World', slug: 'world' },
  { label: 'Business', slug: 'business' },
  { label: 'Technology', slug: 'technology' },
  { label: 'Entertainment', slug: 'entertainment' },
  { label: 'Sports', slug: 'sports' },
  { label: 'Science', slug: 'science' },
  { label: 'Health', slug: 'health' },
];

export default function ArticleForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, isAdmin, adminChecked, isLoading: authLoading } = useAuth();
  const { data: existingArticle, isLoading: articleLoading } = useArticle(id || '');
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const uploadImage = useUploadImage();

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    category_slug: '',
    author: '',
    author_role: 'Correspondent',
    image_url: '',
    source_name: '',
    source_url: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (existingArticle) {
      setFormData({
        title: existingArticle.title,
        excerpt: existingArticle.excerpt || '',
        content: existingArticle.content || '',
        category: existingArticle.category,
        category_slug: existingArticle.category_slug,
        author: existingArticle.author || '',
        author_role: existingArticle.author_role || 'Correspondent',
        image_url: existingArticle.image_url || '',
        source_name: existingArticle.source_name || '',
        source_url: existingArticle.source_url || '',
      });
      if (existingArticle.image_url) {
        setImagePreview(existingArticle.image_url);
      }
    }
  }, [existingArticle]);

  if (authLoading || (user && !adminChecked) || (isEditing && articleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleCategoryChange = (value: string) => {
    const category = CATEGORIES.find((c) => c.slug === value);
    if (category) {
      setFormData({
        ...formData,
        category: category.label,
        category_slug: category.slug,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('File size must be less than 5MB');
      return;
    }
 
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    try {
      const url = await uploadImage.mutateAsync(file);
      setFormData({ ...formData, image_url: url });
    } catch {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category) {
      return;
    }

    try {
      if (isEditing) {
        await updateArticle.mutateAsync({ id, formData });
      } else {
        await createArticle.mutateAsync(formData);
      }
      navigate('/admin');
    } catch {
      // Error is handled in the mutation
    }
  };

  const isSubmitting = createArticle.isPending || updateArticle.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="news-headline text-xl">
            {isEditing ? 'Edit Article' : 'New Article'}
          </h1>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter article title"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category_slug}
                  onValueChange={handleCategoryChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Brief summary of the article"
                  rows={3}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Full article content"
                  rows={10}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {uploadImage.isPending && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP, or GIF (max 5MB)
                  </p>
                </div>
              )}

              {/* Or use URL */}
              <div className="mt-4">
                <Label htmlFor="image_url">Or paste image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Author Info */}
          <Card>
            <CardHeader>
              <CardTitle>Author Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="author">Author Name</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author_role">Author Role</Label>
                  <Input
                    id="author_role"
                    value={formData.author_role}
                    onChange={(e) =>
                      setFormData({ ...formData, author_role: e.target.value })
                    }
                    placeholder="Correspondent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Source Info */}
          <Card>
            <CardHeader>
              <CardTitle>Source Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="source_name">Source Name</Label>
                  <Input
                    id="source_name"
                    value={formData.source_name}
                    onChange={(e) =>
                      setFormData({ ...formData, source_name: e.target.value })
                    }
                    placeholder="Reuters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source_url">Source URL</Label>
                  <Input
                    id="source_url"
                    value={formData.source_url}
                    onChange={(e) =>
                      setFormData({ ...formData, source_url: e.target.value })
                    }
                    placeholder="https://reuters.com/article/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>{isEditing ? 'Save Changes' : 'Create Article'}</>
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin">Cancel</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
