import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminArticles, useDeleteArticle } from '@/hooks/useArticles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Search,
  Home,
  Newspaper,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const { data: articles, isLoading: articlesLoading } = useAdminArticles();
  const deleteArticle = useDeleteArticle();
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const filteredArticles = articles?.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = async () => {
    await signOut();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      World: 'bg-blue-500',
      Business: 'bg-green-500',
      Technology: 'bg-cyan-500',
      Entertainment: 'bg-purple-500',
      Sports: 'bg-orange-500',
      Science: 'bg-teal-500',
      Health: 'bg-red-500',
    };
    return colors[category] || 'bg-muted';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              <span className="news-headline text-xl">VioNews</span>
            </Link>
            <Badge variant="secondary">Admin Panel</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="news-headline text-3xl mb-2">Article Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all news articles
          </p>
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
          <Button asChild>
            <Link to="/admin/articles/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Article
            </Link>
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
                  <TableHead className="w-[40%]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No articles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles?.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {article.image_url && (
                            <img
                              src={article.image_url}
                              alt=""
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[300px]">
                              {article.title}
                            </p>
                            {article.source_name && (
                              <p className="text-xs text-muted-foreground">
                                Source: {article.source_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getCategoryColor(article.category)} text-white`}
                        >
                          {article.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{article.author || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {article.author_role}
                          </p>
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
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/articles/${article.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{article.title}"? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteArticle.mutate(article.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
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

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Articles</p>
            <p className="text-3xl font-bold">{articles?.length || 0}</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-3xl font-bold">
              {new Set(articles?.map((a) => a.category)).size || 0}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-3xl font-bold">
              {articles?.filter((a) => {
                const date = new Date(a.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date > weekAgo;
              }).length || 0}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
