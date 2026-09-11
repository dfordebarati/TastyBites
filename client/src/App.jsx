//defines all the routes (URL → which page component to show)
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import { AdminRoute, UserRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import MenuItemDetails from './pages/MenuItemDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';
import Dashboard from './pages/admin/Dashboard';
import MenuItems from './pages/admin/MenuItems';
import MenuItemForm from './pages/admin/MenuItemForm';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetails from './pages/admin/OrderDetails';
import Users from './pages/admin/Users';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu/:id" element={<MenuItemDetails />} />
        <Route path="/cart" element={<Cart />} />

        <Route element={<UserRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="menu-items" element={<MenuItems />} />
          <Route path="menu-items/new" element={<MenuItemForm />} />
          <Route path="menu-items/:id/edit" element={<MenuItemForm />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Route>
    </Routes>
  );
}
