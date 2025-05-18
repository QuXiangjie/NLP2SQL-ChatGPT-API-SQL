📦 技术栈

后端：Node.js + Express.js
前端模板引擎：EJS
数据库：MongoDB (存储查询记录和Excel元数据) + SQL Server (目标查询数据库)
文件处理：Multer + XLSX
AI 接口：OpenAI GPT API（用于 NLP 转 SQL）
语言支持：JavaScript

🧰 项目功能

用户登录连接数据库（SQL Server）
上传 Excel 文件，自动提取表头和部分数据样本
自然语言输入查询意图，自动转换为 SQL 并执行
展示查询结果，支持多轮查询管理
保存历史 SQL 查询记录
支持 Excel 文件更新与删除
查询与结果详情页展示

📁 目录结构

.
├── controllers/              # 控制器逻辑
│   ├── databaseControllers.js      # 连接数据库 & 执行查询
│   ├── Excel2SQLControllers.js    # 处理 Excel 上传、解析与交互
│   └── nlp2sqlControllers.js      # GPT API 自然语言转 SQL
│
├── models/                  # Mongoose 模型定义
│   ├── SQLQuery.js              # SQL 查询记录模型
│   └── ExcelFile.js             # Excel 文件及其元数据模型
│
├── routes/                  # 路由设置
│   └── index.js                # 主路由文件
│
├── public/                  # 静态资源文件 (CSS, JS, 图标等)
│
├── uploads/                # 上传的 Excel 文件缓存 (如需)
│
├── views/                  # EJS 前端模板
│   ├── index.ejs
│   ├── details.ejs
│   └── menu.ejs
│
├── app.js / server.js       # 主应用入口
└── README.md               # 项目说明文件

⚙️ 快速启动

克隆项目
git clone https://github.com/your-username/NLP2SQL.git
cd NLP2SQL
安装依赖
npm install
配置环境变量
在项目根目录创建 .env 文件，添加以下内容（视情况而定）：

OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
运行项目
npm start
访问地址
浏览器访问：http://localhost:3000
