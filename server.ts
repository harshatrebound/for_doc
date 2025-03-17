import express from 'express';
import cors from 'cors';
import compression from 'compression';
import sitemapRouter from './src/api/sitemap';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(compression());

// Routes
app.use('/', sitemapRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 