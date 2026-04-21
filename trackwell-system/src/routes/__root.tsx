import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Provider } from 'react-redux';
import store from '@/store';

export const Route = createFileRoute('/')({
  component: () => (
    <Provider store={store}>
      <Outlet />
    </Provider>
  ),
});
