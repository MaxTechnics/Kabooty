import polka from 'polka';
import { handler } from './build/handler.js';

const app = polka();

app.get('/healthy', (req, res) => {
	res.sendStatus(200);
});

app.use(handler);

app.listen(3000, () => {
	console.log('Kabooty started on port 3000');
});
