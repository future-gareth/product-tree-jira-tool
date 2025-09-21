const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'ui')));

// API routes for serverless functions
app.post('/api/jira-search', async (req, res) => {
  try {
    // Simple implementation - in production you'd integrate with Jira API
    const { query, jiraUrl, username, apiToken } = req.body;
    
    // Mock response for now
    res.json({
      success: true,
      data: {
        issues: [
          {
            key: 'PROJ-123',
            summary: 'Sample Issue',
            description: 'This is a sample issue for demonstration',
            status: 'In Progress',
            assignee: 'John Doe'
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Product Tree from Jira running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
});
