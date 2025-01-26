import { createBrowserRouter } from "react-router-dom";
import About from "../page/About/index";
import Home from "../page/Home/index";
import Dashboard from "../page/Dashboard/index";
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