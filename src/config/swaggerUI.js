const swaggerUIAssets = require('swagger-ui-dist/absolute-path');

// Custom CSS for professional styling
const customCSS = `
  .swagger-ui .topbar { 
    display: none; 
  }
  .swagger-ui .info {
    margin: 20px 0;
  }
  .swagger-ui .info .title {
    color: #2c3e50;
    font-size: 2.5em;
    font-weight: bold;
  }
  .swagger-ui .info .description {
    font-size: 1.1em;
    line-height: 1.6;
    color: #34495e;
  }
  .swagger-ui .scheme-container {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
  }
  .swagger-ui .opblock.opblock-post {
    border-color: #27ae60;
    background: rgba(39, 174, 96, 0.1);
  }
  .swagger-ui .opblock.opblock-get {
    border-color: #3498db;
    background: rgba(52, 152, 219, 0.1);
  }
  .swagger-ui .opblock.opblock-put {
    border-color: #f39c12;
    background: rgba(243, 156, 18, 0.1);
  }
  .swagger-ui .opblock.opblock-delete {
    border-color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
  }
  .swagger-ui .response-col_status {
    font-weight: bold;
  }
  .swagger-ui .parameter__name {
    font-weight: bold;
    color: #2c3e50;
  }
  .swagger-ui .btn.authorize {
    background-color: #27ae60;
    border-color: #27ae60;
  }
  .swagger-ui .btn.authorize:hover {
    background-color: #229954;
    border-color: #229954;
  }
`;

module.exports = {
  customCSS,
  swaggerUIAssets
};
