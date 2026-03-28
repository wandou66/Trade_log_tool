@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Trade log tool

where python >nul 2>nul
if errorlevel 1 (
  echo 未检测到 Python。
  echo 请先在这台电脑安装 Python 3.10 或更高版本，并勾选 Add Python to PATH。
  pause
  exit /b 1
)

echo 正在启动 Trade log tool...
python web_server.py

pause
