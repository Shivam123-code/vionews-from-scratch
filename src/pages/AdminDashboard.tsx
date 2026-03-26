import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminArticles, useDeleteArticle, useBulkDeleteArticles } from '@/hooks/useArticles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Plus, Pencil, Trash2, LogOut, Search, Home, Zap,
  RefreshCw, ExternalLink, Eye, EyeOff,
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['All', 'World', 'Technology', 'Business', 'Politics', 'Sports'];

export default function AdminDashboard() {
  const { user, isAdmin, adminChecked, isLoading, signOut } = useAuth();
  const { data: articles, isLoading: articlesLoading, refetch } = useAdminArticles();
  const deleteArticle = useDeleteArticle();
  const bulkDelete = useBulkDeleteArticles();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isFetching, setIsFetching] = useState(false);
  const [autoPublish, setAutoPublish] = useState(true);
  const [autoPublishLoading, setAutoPublishLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { toast } = useToast();

  // Load auto_publish setting
  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'auto_publish').maybeSingle()
      .then(({ data }) => {
        if (data) setAutoPublish(data.value === 'true');
      });
  }, []);

  if (isLoading || (user && !adminChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const filteredArticles = articles?.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSignOut = async () => { await signOut(); };

  const handleRefreshNews = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('refresh-news');
      if (error) {
        toast({ title: 'Fetch failed', description: error.message || 'Could not refresh news', variant: 'destructive' });
      } else {
        toast({ title: 'News refreshed', description: data?.message || 'Articles fetched successfully' });
        refetch();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to trigger news fetch', variant: 'destructive' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggleAutoPublish = async () => {
    setAutoPublishLoading(true);
    const newValue = !autoPublish;
    const { error } = await supabase
      .from('settings')
      .update({ value: String(newValue), updated_at: new Date().toISOString() })
      .eq('key', 'auto_publish');
    if (!error) {
      setAutoPublish(newValue);
      toast({ title: `Auto-Publishing ${newValue ? 'ON' : 'OFF'}` });
    } else {
      toast({ title: 'Error', description: 'Failed to update setting', variant: 'destructive' });
    }
    setAutoPublishLoading(false);
  };

  const handleTogglePublish = async (id: string, currentlyPublished: boolean | null) => {
    const newVal = !currentlyPublished;
    const { error } = await supabase.from('articles').update({ is_published: newVal }).eq('id', id);
    if (!error) {
      toast({ title: newVal ? 'Article published' : 'Article unpublished' });
      refetch();
    } else {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      World: 'bg-news-world', Business: 'bg-news-business',
      Technology: 'bg-news-tech', Politics: 'bg-news-politics', Sports: 'bg-news-sports',
    };
    return colors[category] || 'bg-muted';
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredArticles) {
      setSelectedIds(new Set(filteredArticles.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkDelete = () => {
    bulkDelete.mutate(Array.from(selectedIds), {
      onSuccess: () => {
        setSelectedIds(new Set());
        setShowBulkDeleteDialog(false);
        refetch();
      },
    });
  };

  const todayCount = articles?.filter((a) => {
    return new Date(a.created_at).toDateString() === new Date().toDateString();
  }).length || 0;

  const categoryCounts: Record<string, number> = {};
  articles?.forEach((a) => { categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1; });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5">
              <Zap className="h-6 w-6 text-logo fill-logo" />
              <span className="text-xl font-bold"><span className="text-logo">Vio</span>News</span>
            </Link>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/"><Home className="h-4 w-4 mr-2" />View Site</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Article Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage all news articles</p>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Articles</p>
            <p className="text-3xl font-bold">{articles?.length || 0}</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-3xl font-bold">{todayCount}</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Categories</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(categoryCounts).slice(0, 5).map(([cat, count]) => (
                <Badge key={cat} variant="secondary" className="text-xs">{cat}: {count}</Badge>
              ))}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-3">News Fetch</p>
            <Button onClick={handleRefreshNews} disabled={isFetching} size="sm" className="w-full gap-2">
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {isFetching ? 'Fetching...' : 'Fetch Now'}
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-3">Auto-Publishing</p>
            <div className="flex items-center gap-3">
              <Switch
                checked={autoPublish}
                onCheckedChange={handleToggleAutoPublish}
                disabled={autoPublishLoading}
              />
              <span className={`text-sm font-medium ${autoPublish ? 'text-green-600' : 'text-muted-foreground'}`}>
                {autoPublish ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </div>

        {/* Sitemap Links */}
        <div className="flex flex-wrap gap-3 mb-6">
          <a href="https://vionews.in/sitemap.xml" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <ExternalLink className="h-3.5 w-3.5" /> View Main Sitemap
          </a>
          <a href="https://vionews.in/news-sitemap.xml" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <ExternalLink className="h-3.5 w-3.5" /> View News Sitemap
          </a>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedIds.size > 0 && (
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedIds.size} Articles</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.size} selected articles? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={bulkDelete.isPending}
                  >
                    {bulkDelete.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button asChild>
            <Link to="/admin/articles/new"><Plus className="h-4 w-4 mr-2" />Add Article</Link>
          </Button>
        </div>

        {/* Articles Table */}
        {articlesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={filteredArticles?.length ? selectedIds.size === filteredArticles.length : false}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                  </TableHead>
                  <TableHead className="w-[35%]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No articles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles?.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {article.image_url && (
                            <img src={article.image_url} alt="" className="w-12 h-12 rounded object-cover" loading="lazy" width={48} height={48} />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[300px]">{article.title}</p>
                            {article.source_name && (
                              <p className="text-xs text-muted-foreground">Source: {article.source_name}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getCategoryColor(article.category)} text-white`}>{article.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={article.is_published ? 'default' : 'secondary'}>
                          {article.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{article.author || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{article.author_role}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {article.published_at
                            ? format(new Date(article.published_at), 'MMM d, yyyy')
                            : format(new Date(article.created_at), 'MMM d, yyyy')}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title={article.is_published ? 'Unpublish' : 'Publish'}
                            onClick={() => handleTogglePublish(article.id, article.is_published)}>
                            {article.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/articles/${article.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{article.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteArticle.mutate(article.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
