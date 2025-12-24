import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import courseRoutes from './routes/course.routes';
import progressRoutes from './routes/progress.routes';
import testRoutes from './routes/test.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.get('/', (req: Request, res: Response) => {
    res.send('Shoraj Learning Platform API');
});

app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tests', testRoutes);

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
