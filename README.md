# Trade log tool

这个项目目前已经进入“本阶段完成”状态。

为了不破坏你前面调出来的最终版本，我这次做的是非破坏式整理：
- 保留开发过程文件
- 保留设计稿
- 保留正式 Web 版
- 保留便携交付版

## 当前目录说明

### 1. 正式可用版本

- `web_server.py`
  本地启动服务入口。

- `web/`
  正式 Web 前端文件。
  现在默认入口是：
  - `web/index.html`

- `data/trades.json`
  本地交易记录数据。

### 2. 便携交付版本

- `Trade_log_tool_portable/`
  这是给另一台电脑直接使用的便携版。

里面保留的是最终运行需要的最小集合：
- `web_server.py`
- `web/index.html`
- `web/app.js`
- `web/app_update_theme.js`
- `web/styles_update_theme.css`
- `data/`
- `exports_json/`
- `启动 Trade log tool.bat`

### 3. 设计与过程文件

这些文件保留，方便以后回看设计过程：

- `trade_journal_mockup.html`
- `trade_journal_mockup - 副本.html`
- `_mockup_body.txt`
- `_mockup_style.txt`

### 4. 交易系统研究资料

- `langlang_trading_system.md`
  浪浪交易系统整理文档

- `langlang_log/`
  原始资料、分析图、交割单、补充记录

## 启动方式

在项目根目录 `K:\my project` 打开 PowerShell，运行：

```powershell
python .\projects\lang_log_tool\web_server.py
```

然后访问：

```text
http://127.0.0.1:8765
```

## 便携版启动方式

如果是便携版，直接双击：

- `Trade_log_tool_portable/启动 Trade log tool.bat`

## 数据与备份

默认数据文件：

```text
projects/lang_log_tool/data/trades.json
```

建议定期备份两种：

1. 直接复制 `data/trades.json`
2. 在页面里导出 JSON

导出文件名规则现在是：

```text
YYYYMMDD-HHMMSS-trades-export.json
```

## 当前建议

这个项目现在适合保持下面的使用方式：

- `projects/lang_log_tool`
  继续作为开发源项目和过程项目

- `Trade_log_tool_portable`
  作为交付版 / 搬到别的电脑使用的版本

如果后面继续升级，建议只在源项目里改，确认稳定后再同步到便携版。
