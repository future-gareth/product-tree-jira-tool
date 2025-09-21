# Product Tree from Jira

A web application that converts Jira data into structured product tree XML files. This tool helps product managers and teams visualize their product hierarchy from Jira data using a simple form-based interface.

## 🚀 Features

- **Form-Based Interface**: Simple web form for entering Jira data
- **Product Tree Generation**: Convert Jira data to structured XML
- **XML Export**: Generate product tree XML files
- **Web Interface**: Easy-to-use web interface
- **RESTful API**: Programmatic access to conversion functionality
- **Health Monitoring**: Built-in health check endpoint

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Modern web browser

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/future-gareth/product-tree-jira-tool.git
   cd product-tree-jira-tool
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
2. Fill in the product information form:
   - Product title
   - Product description
   - Goals and objectives
   - Jobs to be done
   - Work items
3. Generate the product tree XML
4. Download the result

### API Usage

#### Jira Search (Mock Implementation)
```http
POST /api/jira-search
Content-Type: application/json

{
  "query": "search term",
  "jiraUrl": "https://yourcompany.atlassian.net",
  "username": "your-email@company.com",
  "apiToken": "your-api-token"
}
```

#### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📁 File Structure

```
product-tree-jira-tool/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── ui/                    # Frontend interface
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── fonts/            # Custom fonts
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

## 📊 Supported Data Structure

The tool generates XML following this structure:
```xml
<product_tree>
  <product>
    <goal>
      <job>
        <work_item>
          <work>...</work>
        </work_item>
      </job>
    </goal>
  </product>
</product_tree>
```

## 🔧 Configuration Options

The form allows you to configure:
- Product title and description
- Multiple goals and objectives
- Jobs to be done for each goal
- Work items for each job
- Work breakdown for each work item

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

- Input validation and sanitization
- CORS configuration
- Error handling
- Health monitoring

## 📊 Monitoring

Health check endpoint for monitoring:

```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
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
- Form-based product tree generation
- Web interface
- Multiple deployment options
- RESTful API