# 项目结构说明

## 根目录

- `README.md`
  项目总说明

- `PROJECT_STRUCTURE.md`
  当前结构说明

- `web_server.py`
  正式版本地服务入口

- `trade_journal_app.py`
  早期桌面版原型，当前不是主版本

## 正式前端

- `web/index.html`
  最终正式入口

- `web/app.js`
  主前端逻辑

- `web/app_update_theme.js`
  主题切换与最终增强逻辑

- `web/styles_update_theme.css`
  最终主题样式

## 数据

- `data/trades.json`
  交易记录数据

## 便携版

- `Trade_log_tool_portable/`
  最终可搬走版本

## 设计稿

- `trade_journal_mockup.html`
- `trade_journal_mockup - 副本.html`
- `_mockup_body.txt`
- `_mockup_style.txt`

## 研究资料

- `langlang_trading_system.md`
- `langlang_log/`

## 整理原则

当前项目采用这条原则：

- 正式运行只认 `web/index.html`
- 开发过程文件保留，不主动删除
- 便携交付只保留最终运行所需文件
