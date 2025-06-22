// Simplified recommendation system without OpenAI API dependency

// Generate a simple content fingerprint based on keywords and tags
function generateContentFingerprint(content, tags = []) {
  // Extract keywords from content
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 50); // Limit to top 50 words
  
  // Combine with tags
  const allKeywords = [...words, ...tags.map(tag => tag.toLowerCase())];
  
  // Create a simple frequency-based fingerprint
  const fingerprint = {};
  allKeywords.forEach(word => {
    fingerprint[word] = (fingerprint[word] || 0) + 1;
  });
  
  return fingerprint;
}

// Calculate similarity between two content fingerprints
function calculateSimilarity(fingerprint1, fingerprint2) {
  const words1 = Object.keys(fingerprint1);
  const words2 = Object.keys(fingerprint2);
  
  // Find common words
  const commonWords = words1.filter(word => words2.includes(word));
  
  if (commonWords.length === 0) return 0;
  
  // Calculate weighted similarity
  let similarity = 0;
  commonWords.forEach(word => {
    const freq1 = fingerprint1[word];
    const freq2 = fingerprint2[word];
    similarity += Math.min(freq1, freq2) / Math.max(freq1, freq2);
  });
  
  return similarity / commonWords.length;
}

// Generate content fingerprint (replaces OpenAI embedding)
function analyzeContent(blogText, tags = []) {
  try {
    return generateContentFingerprint(blogText, tags);
  } catch (error) {
    console.error('Content analysis error:', error);
    return {};
  }
}

// Generate user preference fingerprint
function generateUserEmbedding(preferences) {
  try {
    // Create a simple preference fingerprint
    const preferenceText = Array.isArray(preferences) 
      ? preferences.join(' ') 
      : preferences;
    
    return generateContentFingerprint(preferenceText);
  } catch (error) {
    console.error('User embedding error:', error);
    return {};
  }
}

// Calculate similarity between user preferences and blog content
function calculateUserBlogSimilarity(userPreferences, blogContent, blogTags = []) {
  const userFingerprint = generateUserEmbedding(userPreferences);
  const blogFingerprint = generateContentFingerprint(blogContent, blogTags);
  
  return calculateSimilarity(userFingerprint, blogFingerprint);
}

// Enhanced similarity calculation for recommendations
function calculateSimilarityScore(userPreferences, blogContent, blogTags = [], readingHistory = []) {
  let score = 0;
  
  // 1. Content similarity (40% weight)
  const contentSimilarity = calculateUserBlogSimilarity(userPreferences, blogContent, blogTags);
  score += contentSimilarity * 0.4;
  
  // 2. Tag overlap (30% weight)
  if (userPreferences.length > 0 && blogTags.length > 0) {
    const commonTags = userPreferences.filter(pref => 
      blogTags.some(tag => tag.toLowerCase().includes(pref.toLowerCase()))
    );
    const tagOverlap = commonTags.length / userPreferences.length;
    score += tagOverlap * 0.3;
  }
  
  // 3. Reading history similarity (30% weight)
  if (readingHistory.length > 0) {
    const historySimilarities = readingHistory.map(history => {
      if (history.blogId && history.blogId.content) {
        return calculateSimilarity(
          generateContentFingerprint(history.blogId.content, history.blogId.tags || []),
          generateContentFingerprint(blogContent, blogTags)
        );
      }
      return 0;
    });
    
    const avgHistorySimilarity = historySimilarities.reduce((sum, sim) => sum + sim, 0) / historySimilarities.length;
    score += avgHistorySimilarity * 0.3;
  }
  
  return Math.min(score, 1); // Cap at 1.0
}

// Fallback recommendation algorithm
function getFallbackRecommendations(allBlogs, userPreferences = [], readingHistory = []) {
  return allBlogs.map(blog => {
    const score = calculateSimilarityScore(
      userPreferences, 
      blog.content, 
      blog.tags, 
      readingHistory
    );
    
    return {
      ...blog.toObject(),
      similarityScore: score
    };
  }).sort((a, b) => b.similarityScore - a.similarityScore);
}

module.exports = { 
  analyzeContent, 
  generateUserEmbedding,
  calculateSimilarity,
  calculateSimilarityScore,
  getFallbackRecommendations
}; 