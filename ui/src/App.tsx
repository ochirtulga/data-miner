import { useState, useEffect } from 'react';
import {
  Button, Container, Typography, Box, CircularProgress, Card, CardContent, Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, TextField
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { runScraperOnce, getTopWords, getDbStats, getPosts, getSubreddits } from './api/backend';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorageIcon from '@mui/icons-material/Storage';
import ForumIcon from '@mui/icons-material/Forum';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListAltIcon from '@mui/icons-material/ListAlt';

function App() {
  const [scraperStatus, setScraperStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [topWords, setTopWords] = useState<{ word: string; frequency: number }[]>([]);
  const [dbStats, setDbStats] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [subreddit, setSubreddit] = useState('Python');
  const [analyzerSummary, setAnalyzerSummary] = useState<any | null>(null);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);
  const [subredditFilter, setSubredditFilter] = useState<string | null>(null);
  const [subredditOptions, setSubredditOptions] = useState<string[]>([]);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [numPosts, setNumPosts] = useState(20);

  // Update handleRunScraper to use numPosts
  const handleRunScraper = async () => {
    setLoading(true);
    setScraperStatus(null);
    setAnalyzerSummary(null);
    setAnalyzerError(null);
    setTopWords([]);
    
    try {
      // Run scraper
      const res = await runScraperOnce(subreddit, numPosts);
      if (res.status === 'completed') {
        const newPostsCount = res.new_posts_count || 0;
        setScraperStatus(`Scraper finished! Found ${newPostsCount} new posts. Word frequencies updated.`);
        // Fetch updated top words immediately after scraping
        try {
          const topWordsRes = await getTopWords(20);
          setTopWords(topWordsRes.words || []);
        } catch (e) {
          console.error('Failed to fetch top words:', e);
        }
        // Also fetch updated DB stats
        handleGetDbStats();
      } else {
        setScraperStatus('Error running scraper');
      }
    } catch (e) {
      setScraperStatus('Error running scraper');
    }
    setLoading(false);
  };

  const handleIncrementalAnalyze = async () => {
    setAnalyzeLoading(true);
    try {
      await fetch('http://localhost:8000/analyzer/incremental', { method: 'POST' });
      await handleRefreshTopWords();
    } catch (e) {
      console.error('Failed to run incremental analyzer:', e);
    }
    setAnalyzeLoading(false);
  };

  const handleGetDbStats = async () => {
    setStatsLoading(true);
    setDbStats(null);
    try {
      const stats = await getDbStats();
      setDbStats(stats);
    } catch (e) {
      setDbStats(null);
    }
    setStatsLoading(false);
  };

  const handleGetPosts = async () => {
    setPostsLoading(true);
    setPosts([]);
    try {
      const data = await getPosts(20);
      setPosts(data);
    } catch (e) {
      setPosts([]);
    }
    setPostsLoading(false);
  };

  const handleRefreshTopWords = async () => {
    try {
      const topWordsRes = await getTopWords(20, subredditFilter || undefined);
      setTopWords(topWordsRes.words || []);
    } catch (e) {
      console.error('Failed to fetch top words:', e);
    }
  };

  // Fetch DB stats and latest report on mount
  useEffect(() => {
    handleGetDbStats();
    handleRefreshTopWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch subreddits on mount
  useEffect(() => {
    getSubreddits().then(res => setSubredditOptions(res.subreddits || []));
  }, []);

  // Fetch top words when subredditFilter changes
  useEffect(() => {
    const fetchWords = async () => {
      const topWordsRes = await getTopWords(20, subredditFilter || undefined);
      setTopWords(topWordsRes.words || []);
    };
    fetchWords();
  }, [subredditFilter]);

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 700, mb: 4 }}>
        Reddit Scraper & Analyzer
      </Typography>
      
      {/* Main Controls Row */}
      <Box display="flex" justifyContent="center" alignItems="center" width="100%" mb={4}>
        <Card sx={{ boxShadow: 3, width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 4, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
          <CardContent sx={{ width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
              <TextField
                label="Subreddit"
                variant="outlined"
                size="small"
                value={subreddit}
                onChange={e => setSubreddit(e.target.value)}
                sx={{ minWidth: 140, background: 'white', borderRadius: 2, boxShadow: 1 }}
              />
              <TextField
                label="# Posts"
                type="number"
                variant="outlined"
                size="small"
                value={numPosts}
                onChange={e => setNumPosts(Number(e.target.value))}
                sx={{ minWidth: 100, background: 'white', borderRadius: 2, boxShadow: 1 }}
                inputProps={{ min: 1, max: 100 }}
              />
              <Button
                variant="contained"
                onClick={handleRunScraper}
                disabled={loading}
                size="large"
                startIcon={<PlayArrowIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  boxShadow: 3,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%)',
                    boxShadow: 6,
                  },
                  transition: 'all 0.2s',
                }}
              >
                Run Scraper & Analyze
              </Button>
              {(loading || statsLoading || postsLoading) && <CircularProgress size={28} sx={{ ml: 2 }} />}
              <Button
                variant="contained"
                onClick={handleIncrementalAnalyze}
                disabled={analyzeLoading}
                size="large"
                startIcon={<TrendingUpIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  boxShadow: 3,
                  background: 'linear-gradient(90deg, #06beb6 0%, #48b1f3 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                    boxShadow: 6,
                  },
                  transition: 'all 0.2s',
                }}
              >
                Incremental Analyze
              </Button>
              {analyzeLoading && <CircularProgress size={28} sx={{ ml: 2 }} />}
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center" sx={{ width: '100%', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleGetDbStats}
                disabled={statsLoading}
                size="large"
                startIcon={<BarChartIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'white',
                  color: 'primary.main',
                  borderColor: 'primary.light',
                  '&:hover': {
                    background: '#f0f4ff',
                    borderColor: 'primary.main',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Refresh DB Stats
              </Button>
              <Button
                variant="outlined"
                onClick={handleRefreshTopWords}
                size="large"
                startIcon={<RefreshIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'white',
                  color: '#0ea5e9',
                  borderColor: '#0ea5e9',
                  '&:hover': {
                    background: '#e0f2fe',
                    borderColor: '#0284c7',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Refresh Top Words
              </Button>
              <Button
                variant="outlined"
                onClick={handleGetPosts}
                disabled={postsLoading}
                size="large"
                startIcon={<ListAltIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'white',
                  color: '#16a34a',
                  borderColor: '#16a34a',
                  '&:hover': {
                    background: '#dcfce7',
                    borderColor: '#15803d',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Show Recent Posts
              </Button>
            </Stack>
            {scraperStatus && (
              <Typography sx={{ mt: 2 }} color={scraperStatus.includes('Error') ? 'error' : 'success.main'} align="center">
                {scraperStatus}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Split into two columns */}
      <Grid container spacing={4} alignItems="flex-start" justifyContent="center">
        {/* Left: Analysis Results */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Analysis Summary Section */}
          {(loading || analyzerSummary || analyzerError) && (
            <Card sx={{ boxShadow: 2, width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <CardContent sx={{ width: '90%' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Analysis Results
                </Typography>
                {loading && <CircularProgress size={32} sx={{ display: 'block', mx: 'auto', my: 2 }} />}
                {analyzerError && <Typography color="error" sx={{ mb: 2 }}>{analyzerError}</Typography>}
                {analyzerSummary && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                      Total Unique Words: {analyzerSummary.total_unique_words}<br />
                      Total Word Occurrences: {analyzerSummary.total_word_occurrences}
                    </Typography>
                    
                    {/* Top 10 Words Display */}
                    {analyzerSummary.top_words && analyzerSummary.top_words.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                           Top 10 Most Common Words
                        </Typography>
                        <Grid container spacing={1}>
                          {analyzerSummary.top_words.slice(0, 10).map(([word, count]: [string, number], i: number) => (
                            <Grid item xs={12} sm={6} key={i}>
                              <Paper 
                                elevation={2} 
                                sx={{ 
                                  p: 2, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  background: i < 3 
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                    : i < 6 
                                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                  color: 'white',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 4,
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    sx={{ 
                                      width: 32, 
                                      height: 32, 
                                      borderRadius: '50%', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      mr: 2,
                                      background: 'rgba(255,255,255,0.2)',
                                      fontWeight: 'bold',
                                      fontSize: '1.1rem'
                                    }}
                                  >
                                    {i + 1}
                                  </Box>
                                  <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                      {word}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                      {count.toLocaleString()} occurrences
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {count.toLocaleString()}
                                  </Typography>
                                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                    {((count / analyzerSummary.total_word_occurrences) * 100).toFixed(1)}%
                                  </Typography>
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* File Information */}
                    <Box sx={{ 
                      bgcolor: 'grey.50', 
                      p: 2, 
                      borderRadius: 2, 
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}>
                      {analyzerSummary.report_file && (
                        <Typography variant="body2" sx={{ mb: 0.5, fontFamily: 'monospace' }}>
                          📄 Report: <code>{analyzerSummary.report_file}</code>
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Top Words Table Section */}
          {topWords.length > 0 && (
            <Card sx={{ boxShadow: 2, width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2}}>
              <CardContent sx={{ width: '100%' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Top Words
                </Typography>
                <Box sx={{ mb: 2, width: '100%' }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Filter Top Words by Subreddit:
                  </Typography>
                  <Autocomplete
                    options={["(All)", ...subredditOptions]}
                    value={subredditFilter || "(All)"}
                    onChange={(_, value) => setSubredditFilter(value === "(All)" ? null : value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Subreddit" variant="outlined" size="small" />
                    )}
                    sx={{ width: 260, mx: 'auto', mb: 2, background: 'white', borderRadius: 2, boxShadow: 1 }}
                  />
                </Box>
                <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Word</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Frequency</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topWords.map((word, i) => {
                        const totalFrequency = topWords.reduce((sum, w) => sum + w.frequency, 0);
                        const percentage = ((word.frequency / totalFrequency) * 100).toFixed(1);
                        return (
                          <TableRow key={i} hover sx={{ 
                            bgcolor: i % 2 === 0 ? 'grey.50' : 'white',
                            '&:hover': { bgcolor: 'grey.100' }
                          }}>
                            <TableCell sx={{ fontWeight: 'bold', color: i < 3 ? 'primary.main' : 'inherit' }}>
                              #{i + 1}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: i < 3 ? 'bold' : 'normal',
                              color: i < 3 ? 'primary.main' : 'inherit'
                            }}>
                              {word.word}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{word.frequency.toLocaleString()}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right: DB Stats and Recent Posts */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* DB Stats Section */}
          {dbStats && (
            <Card sx={{ mb: 4, boxShadow: 2, width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CardContent sx={{ width: '90%' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Database Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6}>
                    <Box display="flex" alignItems="center">
                      <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Total Posts:</Typography>
                      <Typography sx={{ ml: 1 }} fontWeight={600}>{dbStats.total_posts}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Box display="flex" alignItems="center">
                      <ForumIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Total Sessions:</Typography>
                      <Typography sx={{ ml: 1 }} fontWeight={600}>{dbStats.total_sessions}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Box display="flex" alignItems="center">
                      <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Oldest Post:</Typography>
                      <Typography sx={{ ml: 1 }} fontWeight={600}>
                        {dbStats.oldest_post ? new Date(dbStats.oldest_post * 1000).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Box display="flex" alignItems="center">
                      <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Newest Post:</Typography>
                      <Typography sx={{ ml: 1 }} fontWeight={600}>
                        {dbStats.newest_post ? new Date(dbStats.newest_post * 1000).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Scrapped by Subreddit:</Typography>
                <Grid container spacing={1}>
                  {dbStats.posts_by_subreddit && Object.entries(dbStats.posts_by_subreddit).map(([sub, count]: any, i: number) => (
                    <Grid item key={i} xs={6} sm={4} md={6}>
                      <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.100' }} elevation={1}>
                        <Typography variant="body2" fontWeight={600}>r/{sub}</Typography>
                        <Typography variant="h6" color="primary">{count}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Posts Table Section */}
          {postsLoading && <CircularProgress size={32} sx={{ display: 'block', mx: 'auto', my: 4 }} />}
          {posts.length > 0 && (
            <Card sx={{ mb: 4, boxShadow: 2, width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CardContent sx={{ width: '100%' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  <ForumIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recent Posts
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 500, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, display: 'flex', justifyContent: 'center' }}>
                  <Table stickyHeader size="small" sx={{ width: 'fit-content', minWidth: 700 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Author</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Comments</TableCell>
                        <TableCell>URL</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {posts.map((post, i) => (
                        <TableRow key={i} hover sx={{ bgcolor: i % 2 === 0 ? 'grey.50' : 'white' }}>
                          <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={post.title}>{post.title}</TableCell>
                          <TableCell>{post.author}</TableCell>
                          <TableCell>{post.score}</TableCell>
                          <TableCell>{post.num_comments}</TableCell>
                          <TableCell>
                            {post.url ? (
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}
                              >
                                View Post
                              </a>
                            ) : (
                              <span style={{ color: '#888' }}>N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(post.created_utc * 1000).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
