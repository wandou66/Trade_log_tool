import json
import webbrowser
from dataclasses import dataclass, field
from datetime import datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


APP_DIR = Path(__file__).resolve().parent
WEB_DIR = APP_DIR / "web"
DATA_DIR = APP_DIR / "data"
DATA_FILE = DATA_DIR / "trades.json"
HOST = "127.0.0.1"
PORT = 8765
DEFAULT_PAGE = "index.html"

FIELD_ALIASES = {
    "trade_direction": "tradeDirection",
    "entry_time": "entryTime",
    "entry_price": "entryPrice",
    "exit_time": "exitTime",
    "exit_price": "exitPrice",
    "risk_amount": "riskAmount",
    "pnl_amount": "pnlAmount",
    "r_multiple": "rMultiple",
    "market_season": "marketSeason",
    "market_season_note": "marketSeasonNote",
    "market_state": "marketState",
    "market_state_note": "marketStateNote",
    "market_heat": "marketHeat",
    "market_heat_note": "marketHeatNote",
    "target_type": "targetType",
    "target_type_note": "targetTypeNote",
    "entry_logic": "entryLogic",
    "entry_logic_note": "entryLogicNote",
    "direction_attr": "directionAttr",
    "direction_attr_note": "directionAttrNote",
    "entry_emotions": "entryEmotions",
    "exit_emotions": "exitEmotions",
    "entry_emotions_note": "entryEmotionsNote",
    "exit_emotions_note": "exitEmotionsNote",
    "tags_note": "tagsNote",
    "execution_summary": "executionSummary",
    "review_notes": "reviewNotes",
    "created_at": "createdAt",
}


def guess_type(path: Path) -> str:
    if path.suffix == ".html":
        return "text/html; charset=utf-8"
    if path.suffix == ".css":
        return "text/css; charset=utf-8"
    if path.suffix == ".js":
        return "application/javascript; charset=utf-8"
    if path.suffix == ".json":
        return "application/json; charset=utf-8"
    return "application/octet-stream"


def normalize_image(image: dict) -> dict:
    return {
        "name": str(image.get("name") or ""),
        "mimeType": str(image.get("mimeType") or image.get("mime_type") or "application/octet-stream"),
        "data": str(image.get("data") or ""),
        "size": int(image.get("size") or 0),
    }


def normalize_string_list(value) -> list[str]:
    if isinstance(value, str):
        text = value.strip()
        return [text] if text else []

    if isinstance(value, (list, tuple, set)):
        normalized = []
        for item in value:
            if item is None:
                continue
            text = str(item).strip()
            if text:
                normalized.append(text)
        return normalized

    return []


def normalize_record(record: dict) -> dict:
    normalized = {}
    for key, value in record.items():
        normalized[FIELD_ALIASES.get(key, key)] = value

    images = normalized.get("images") or []
    if not isinstance(images, list):
        images = []

    return {
        "id": str(normalized.get("id") or ""),
        "status": str(normalized.get("status") or "持仓中"),
        "symbol": str(normalized.get("symbol") or ""),
        "tradeDirection": str(normalized.get("tradeDirection") or "多"),
        "entryTime": str(normalized.get("entryTime") or ""),
        "entryPrice": str(normalized.get("entryPrice") or ""),
        "exitTime": str(normalized.get("exitTime") or ""),
        "exitPrice": str(normalized.get("exitPrice") or ""),
        "riskAmount": str(normalized.get("riskAmount") or ""),
        "pnlAmount": str(normalized.get("pnlAmount") or ""),
        "rMultiple": str(normalized.get("rMultiple") or ""),
        "score": str(normalized.get("score") or "8"),
        "marketSeason": str(normalized.get("marketSeason") or ""),
        "marketSeasonNote": str(normalized.get("marketSeasonNote") or ""),
        "marketState": str(normalized.get("marketState") or ""),
        "marketStateNote": str(normalized.get("marketStateNote") or ""),
        "marketHeat": str(normalized.get("marketHeat") or ""),
        "marketHeatNote": str(normalized.get("marketHeatNote") or ""),
        "targetType": str(normalized.get("targetType") or ""),
        "targetTypeNote": str(normalized.get("targetTypeNote") or ""),
        "entryLogic": str(normalized.get("entryLogic") or ""),
        "entryLogicNote": str(normalized.get("entryLogicNote") or ""),
        "directionAttr": str(normalized.get("directionAttr") or ""),
        "directionAttrNote": str(normalized.get("directionAttrNote") or ""),
        "entryEmotions": normalize_string_list(normalized.get("entryEmotions")),
        "exitEmotions": normalize_string_list(normalized.get("exitEmotions")),
        "entryEmotionsNote": str(normalized.get("entryEmotionsNote") or ""),
        "exitEmotionsNote": str(normalized.get("exitEmotionsNote") or ""),
        "tags": normalize_string_list(normalized.get("tags")),
        "tagsNote": str(normalized.get("tagsNote") or ""),
        "executionSummary": str(normalized.get("executionSummary") or ""),
        "reviewNotes": str(normalized.get("reviewNotes") or ""),
        "images": [normalize_image(image) for image in images if isinstance(image, dict)],
        "createdAt": str(normalized.get("createdAt") or ""),
    }


def normalize_records(payload) -> list[dict]:
    if isinstance(payload, dict):
        if isinstance(payload.get("records"), list):
            payload = payload["records"]
        elif isinstance(payload.get("data"), list):
            payload = payload["data"]
        else:
            payload = []

    if not isinstance(payload, list):
        return []

    return [normalize_record(record) for record in payload if isinstance(record, dict)]


@dataclass
class TradeStore:
    data_file: Path = DATA_FILE
    records: list[dict] = field(default_factory=list)
    load_error: str | None = None

    def __post_init__(self):
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.load()

    def load(self):
        self.load_error = None
        if not self.data_file.exists():
            self.records = []
            return

        try:
            raw = json.loads(self.data_file.read_text(encoding="utf-8-sig"))
        except (OSError, json.JSONDecodeError) as exc:
            self.records = []
            self.load_error = f"读取数据文件失败：{exc}"
            print(self.load_error)
            return

        self.records = normalize_records(raw)

    def save(self):
        self.data_file.write_text(
            json.dumps(self.records, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def upsert(self, record: dict):
        record = normalize_record(record)
        for index, existing in enumerate(self.records):
            if existing.get("id") == record.get("id"):
                self.records[index] = record
                self.save()
                return record
        self.records.append(record)
        self.save()
        return record

    def delete(self, record_id: str):
        before = len(self.records)
        self.records = [record for record in self.records if record.get("id") != record_id]
        if len(self.records) == before:
            return False
        self.save()
        return True


STORE = TradeStore()


class AppHandler(BaseHTTPRequestHandler):
    server_version = "TradeJournalHTTP/1.0"

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/trades":
            if STORE.load_error:
                return self._send_json({"error": STORE.load_error}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            return self._send_json({"records": STORE.records})
        if parsed.path == "/api/export":
            if STORE.load_error:
                return self._send_json({"error": STORE.load_error}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            payload = json.dumps(STORE.records, ensure_ascii=False, indent=2).encode("utf-8")
            export_name = f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-trades-export.json"
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Disposition", f'attachment; filename="{export_name}"')
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        self._serve_static(parsed.path)

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8-sig"))
        except json.JSONDecodeError:
            return self._send_json({"error": "JSON 格式不正确"}, status=HTTPStatus.BAD_REQUEST)

        if STORE.load_error and parsed.path != "/api/import":
            return self._send_json({"error": STORE.load_error}, status=HTTPStatus.CONFLICT)

        if parsed.path == "/api/trades":
            record = payload.get("record")
            if not isinstance(record, dict):
                return self._send_json({"error": "缺少 record"}, status=HTTPStatus.BAD_REQUEST)
            saved = STORE.upsert(record)
            return self._send_json({"ok": True, "record": saved})

        if parsed.path == "/api/import":
            records = normalize_records(payload.get("records", payload))
            if not records:
                return self._send_json({"error": "没有可导入的交易记录"}, status=HTTPStatus.BAD_REQUEST)
            STORE.records = records
            STORE.load_error = None
            STORE.save()
            return self._send_json({"ok": True, "count": len(records), "records": records})

        if parsed.path == "/api/delete":
            record_id = str(payload.get("id") or "")
            if not record_id:
                return self._send_json({"error": "缺少 id"}, status=HTTPStatus.BAD_REQUEST)
            deleted = STORE.delete(record_id)
            if not deleted:
                return self._send_json({"error": "未找到对应记录"}, status=HTTPStatus.NOT_FOUND)
            return self._send_json({"ok": True})

        self._send_json({"error": "未找到接口"}, status=HTTPStatus.NOT_FOUND)

    def log_message(self, format, *args):
        return

    def _serve_static(self, path: str):
        if path in ("", "/"):
            path = f"/{DEFAULT_PAGE}"
        safe_path = (WEB_DIR / path.lstrip("/")).resolve()
        if WEB_DIR.resolve() not in safe_path.parents and safe_path != WEB_DIR.resolve():
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        if not safe_path.exists() or not safe_path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content = safe_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", guess_type(safe_path))
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def _send_json(self, data: dict, status: HTTPStatus = HTTPStatus.OK):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def main():
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    url = f"http://{HOST}:{PORT}"
    print(f"交易记录工具已启动：{url}")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("服务已停止。")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
