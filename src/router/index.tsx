import { createBrowserRouter } from "react-router-dom";
import About from "../pages/About/index";
import Home from "../pages/Home/index";
import Dashboard from "../pages/Dashboard/index";
import App from "../App";
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/about",
                element: <About />,
            },
        ],
    },
]);

export default router;