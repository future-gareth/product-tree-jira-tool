# Product Tree from Jira

A web application that converts Jira CSV exports into structured product tree XML files. This tool helps product managers and teams visualize their product hierarchy from Jira data.

## 🚀 Features

- **CSV Import**: Upload Jira CSV exports directly
- **Product Tree Generation**: Convert Jira data to structured XML
- **Multiple Export Formats**: Support for various product tree formats
- **Web Interface**: Easy-to-use web interface
- **Serverless Options**: Cloudflare Worker, Netlify, and Vercel deployments
- **RESTful API**: Programmatic access to conversion functionality

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Modern web browser

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/product-tree-from-jira.git
   cd product-tree-from-jira
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## ⚙️ Configuration

The application runs on port 3002 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=3000 npm start
```

## 🚀 Usage

### Web Interface

1. Open your browser and navigate to `http://localhost:3002`
2. Upload your Jira CSV export file
3. Configure the mapping settings
4. Generate the product tree XML
5. Download the result

### API Usage

#### Process Product Tree
```http
POST /api/process-product-tree
Content-Type: multipart/form-data

Form data:
- file: CSV file
- mapping: JSON configuration
```

#### Health Check
```http
GET /health
```

## 📁 File Structure

```
product-tree-from-jira/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── ui/                    # Frontend interface
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── cloudflare-worker/     # Cloudflare Worker deployment
├── netlify/              # Netlify Functions deployment
├── vercel/               # Vercel API deployment
└── examples/             # Sample files and documentation
```

## 🚀 Deployment Options

### 1. Traditional Server (Node.js)
```bash
npm start
```

### 2. Cloudflare Worker
```bash
cd cloudflare-worker
wrangler deploy
```

### 3. Netlify Functions
```bash
cd netlify
netlify deploy
```

### 4. Vercel
```bash
cd vercel
vercel deploy
```

## 📊 Supported Jira CSV Formats

The tool supports standard Jira CSV exports with the following fields:
- Issue Key
- Summary
- Issue Type
- Status
- Priority
- Components
- Labels
- Epic Link
- Parent Link

## 🔧 Configuration Options

### CSV Mapping
Configure how Jira fields map to product tree structure:

```json
{
  "hierarchy": {
    "epic": "Epic Link",
    "story": "Issue Type",
    "task": "Issue Type"
  },
  "fields": {
    "title": "Summary",
    "status": "Status",
    "priority": "Priority"
  }
}
```

## 🐳 Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3002

CMD ["npm", "start"]
```

## 🔒 Security

- File upload validation
- CSV parsing sanitization
- Input validation
- Error handling

## 📊 Monitoring

Health check endpoint for monitoring:

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "Product Tree from Jira"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the examples directory
- Review the API documentation

## 🔄 Changelog

### v1.0.0
- Initial release
- CSV to XML conversion
- Web interface
- Multiple deployment options
- RESTful API