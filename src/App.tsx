import React from "react";
import { Layout, Menu, theme } from "antd";
import { Link, Outlet } from "react-router-dom";
const { Content, Sider } = Layout;

const items = [
    { path: "/", key: "1", label: "Home" },
    { path: "/dashboard", key: "2", label: "Dashboard" },
    { path: "/about", key: "3", label: "About" },
];

const App: React.FC = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider breakpoint="lg" collapsedWidth="0">
                <div className="demo-logo-vertical" />
                <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
                    {items.map((item) => (
                        <Menu.Item key={item.key}>
                            <Link to={item.path}>{item.label}</Link>
                        </Menu.Item>
                    ))}
                </Menu>
            </Sider>
            <Layout>
                <Content style={{ margin: "6px 6px 0" }}>
                    <div
                        style={{
                            padding: 6,
                            minHeight: "100vh",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;
