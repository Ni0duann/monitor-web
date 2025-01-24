import { createBrowserRouter } from "react-router-dom";
import Home from "../page/Home";
import Dashboard from '@/page/Dashboard';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/dashboard',
        element: <Dashboard />
    }
])


export default router;