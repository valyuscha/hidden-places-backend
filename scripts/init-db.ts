import 'dotenv/config';
import DataSource from '../src/data-source';

DataSource.initialize()
  .then(async () => {
    console.log('Data source initialized.');
    await DataSource.destroy();
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
