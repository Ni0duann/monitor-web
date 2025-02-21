# monitor-web

## 项目结构

```
monitor-web/
├── public/                  // 静态资源目录
│   └── vite.svg            // Vite logo
├── src/                    // 源代码目录
│   ├── api/                // API接口相关
│   │   └── index.ts        // API入口文件
│   ├── assets/             // 静态资源
│   │   └── react.svg       // React logo
│   ├── config/             // 配置相关
│   │   └── webConfig.ts    // Web应用配置
│   ├── interface/          // 接口定义
│   │   └── index.ts        // 接口定义入口
│   ├── pages/              // 页面组件
│   │   ├── About/          // 关于页面
│   │   │   └── index.tsx   // 关于页面组件
│   │   ├── Dashboard/      // 仪表盘页面
│   │   │   ├── index.scss  // 仪表盘样式
│   │   │   └── index.tsx   // 仪表盘组件
│   │   └── Home/           // 首页
│   │       ├── index.scss  // 首页样式
│   │       └── index.tsx   // 首页组件
│   ├── router/             // 路由配置
│   │   └── index.tsx       // 路由配置入口
│   ├── utils/              // 工具函数
│   │   └── getFlowData.ts  // 数据流处理工具
│   ├── App.tsx             // 应用根组件
│   ├── index.css           // 全局样式
│   ├── main.tsx            // 应用入口
│   └── vite-env.d.ts       // Vite环境类型定义
├── .gitignore              // Git忽略配置
├── eslint.config.js        // ESLint配置
├── index.html              // 应用入口HTML
├── package-lock.json       // 依赖锁定文件
├── package.json            // 项目配置
├── pnpm-lock.yaml          // pnpm依赖锁定
├── README.md               // 项目说明文档
├── tsconfig.app.json       // TypeScript应用配置
├── tsconfig.json           // TypeScript主配置
├── tsconfig.node.json      // TypeScript Node配置
└── vite.config.ts          // Vite配置
```
监控系统数据显示台
