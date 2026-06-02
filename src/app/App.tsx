import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CodeProvider } from '../context/CodeContext';
import { DialogProvider } from '../context/DialogContext';

export default function App() {
  return (
    <DialogProvider>
      <CodeProvider>
          <RouterProvider router={router} />
      </CodeProvider>
    </DialogProvider>
  );
}
