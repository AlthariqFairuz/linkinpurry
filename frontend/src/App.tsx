import AppRoutes from './routes';
import RootLayout from './app/layout';

function App() {
  return (
    <RootLayout>
      <AppRoutes />
    </RootLayout>
  );
}

export default App;