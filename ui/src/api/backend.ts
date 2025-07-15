import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export async function runScraperOnce(subreddit: string, numPosts: number = 20) {
  const res = await axios.post(`${API_BASE}/scraper/run-once`, { subreddit, num_posts: numPosts });
  return res.data;
}

export async function getTopWords(topN: number = 10, subreddit?: string) {
  const params: any = { top_n: topN };
  if (subreddit) params.subreddit = subreddit;
  const res = await axios.get(`${API_BASE}/analyzer`, { params });
  return res.data;
}

export async function getSubreddits() {
  const res = await axios.get(`${API_BASE}/analyzer/subreddits`);
  return res.data;
}

export async function getDbStats() {
  const res = await axios.get(`${API_BASE}/db/stats`);
  return res.data;
}

export async function getPosts(limit: number = 20) {
  const res = await axios.get(`${API_BASE}/data/posts`, { params: { limit } });
  return res.data;
}

export async function getLatestAnalysisReport() {
  const res = await axios.get(`${API_BASE}/analyzer/latest-report`);
  return res.data;
}

export async function runFullAnalyzer(options: {
  data_source?: string;
  output_dir?: string;
  top_n?: number;
  search?: string;
  word_details?: string;
  incremental?: boolean;
} = {}) {
  const res = await axios.post(`${API_BASE}/analyzer/run-full`, {
    data_source: options.data_source || 'both',
    output_dir: options.output_dir || 'data/analyzed',
    top_n: options.top_n || 50,
    search: options.search || null,
    word_details: options.word_details || null,
    incremental: options.incremental || false,
  });
  return res.data;
} 