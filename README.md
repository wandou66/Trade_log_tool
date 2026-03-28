# Trade Log Tool Portable

便携版本地交易记录与复盘工具。

项目以本地网页形式运行，不依赖数据库，数据直接保存在 `data/trades.json`。适合单机使用、手动备份、跨电脑迁移。

## 功能

- 记录 `持仓中` / `已完成` 两类交易
- 维护基础交易信息、市场环境、情绪、标签、执行摘要、复盘笔记
- 支持最多 3 张 K 线截图
- 支持首页持仓卡展示、档案详情弹层、明暗主题切换
- 支持 JSON 导入 / 导出

## 运行方式

### 方式 1：双击启动

直接双击：

`启动 Trade log tool.bat`

### 方式 2：命令行启动

在项目目录执行：

```powershell
python web_server.py
```

启动后浏览器会自动打开：

`http://127.0.0.1:8765`

## 环境要求

- Python 3.10 或更高版本
- 建议安装 Python 时勾选 `Add Python to PATH`

## 数据与备份

- 主数据文件：`data/trades.json`
- 导出文件建议存放目录：`exports_json/`

如果要迁移到另一台电脑，可以直接复制整个项目目录，或至少复制：

- `data/`
- 你之前导出的 JSON 文件

## 项目结构

```text
项目根目录/
├─ data/
│  └─ trades.json
├─ exports_json/
├─ web/
│  ├─ index.html
│  ├─ app.js
│  ├─ app_update_theme.js
│  └─ styles_update_theme.css
├─ web_server.py
├─ 启动 Trade log tool.bat
├─ README-使用说明.txt
└─ README.md
```

## 说明

- 这是本地工具，默认只监听 `127.0.0.1`
- 关闭工具时，先关闭浏览器，再回到终端窗口按 `Ctrl + C`
