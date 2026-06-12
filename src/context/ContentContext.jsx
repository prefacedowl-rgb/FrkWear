import React, { createContext, useContext, useState, useEffect } from 'react';
import { getContent } from '../lib/api';

const ContentContext = createContext({
  content: {},
  loading: true,
  refreshContent: async () => {}
});

export function ContentProvider({ children }) {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const data = await getContent();
      setContent(data || {});
    } catch (err) {
      console.error('Failed to load site content from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, refreshContent: fetchContent }}>
      {children}
    </ContentContext.Provider>
  );
}

// Hook to retrieve content key, falling back to defaultValue if loading or undefined
export function useContent(key, defaultValue = '') {
  const { content } = useContext(ContentContext);
  if (content && content[key] !== undefined && content[key] !== null) {
    return content[key];
  }
  return defaultValue;
}

// Hook to access the full content context (useful for refreshing content on updates)
export function useContentContext() {
  return useContext(ContentContext);
}
