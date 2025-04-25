"""
Stock-News Analytics — Flask Backend
portable / host-agnostic version
"""

from flask import (Flask, render_template, request, redirect,
                   url_for, session, jsonify)
import sqlite3, bcrypt, pandas as pd, os, re, uuid
from werkzeug.utils import secure_filename

# ────────────────────────── configuration ──────────────────────────
BASE_DIR     = os.path.dirname(__file__)
SECRET_KEY   = os.getenv("SECRET_KEY", "my_stock_app_2025_secure123")
DATA_DIR     = os.getenv("DATA_DIR" , os.path.join(BASE_DIR, "static", "uploads"))
CSV_PATH     = os.getenv("EXCH_CSV", os.path.join(
                  BASE_DIR, "static", "data", "stock_exchanges_with_colors.csv"))
DB_URL       = os.getenv("DATABASE_URL", os.path.join(BASE_DIR, "database.db"))

os.makedirs(DATA_DIR, exist_ok=True)

app = Flask(__name__, static_folder="static")
app.secret_key = SECRET_KEY

# ────────────────────────── DB helpers ─────────────────────────────
def init_db():
    conn = sqlite3.connect(DB_URL)
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS users(
                   id       INTEGER PRIMARY KEY AUTOINCREMENT,
                   username TEXT UNIQUE NOT NULL,
                   password TEXT NOT NULL,
                   avatar   TEXT
                )""")
    c.execute("""CREATE TABLE IF NOT EXISTS news(
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   exchange  TEXT, country TEXT,
                   title TEXT, link TEXT,
                   published TEXT, source TEXT)""")
    conn.commit(); conn.close()
init_db()

def db_row(sql, *args):
    conn = sqlite3.connect(DB_URL); cur = conn.cursor()
    cur.execute(sql, args); row = cur.fetchone()
    conn.close(); return row

def current_user(): return session.get("username")

def avatar_url(row):
    """Return /static/… URL for avatar, or default."""
    rel = row[0] if row and row[0] else "img/default_avatar.png"
    rel = rel.lstrip("/").removeprefix("static/")   # avoid // or duplicate prefix
    return url_for("static", filename=rel)

# ────────────────────────── auth routes ────────────────────────────
@app.route("/")
def index():
    return redirect(url_for("home") if current_user() else url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        u, p = request.form["username"], request.form["password"].encode()
        row  = db_row("SELECT password FROM users WHERE username=?", u)
        if row and bcrypt.checkpw(p, row[0].encode()):
            session["username"] = u
            return redirect(url_for("home"))
        return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        u = request.form["username"]
        p = request.form["password"].encode()
        hashed = bcrypt.hashpw(p, bcrypt.gensalt()).decode()
        try:
            conn = sqlite3.connect(DB_URL)
            conn.execute("INSERT INTO users(username,password) VALUES(?,?)", (u, hashed))
            conn.commit(); session["username"] = u
            return redirect(url_for("home"))
        except sqlite3.IntegrityError:
            msg = "Username already exists"
            return render_template("register.html", error=msg)
        finally:
            conn.close()
    return render_template("register.html")

@app.route("/logout")
def logout():
    session.pop("username", None)
    return redirect(url_for("login"))

# ────────────────────────── page helpers ───────────────────────────
def render_with_user(template):
    if not current_user():
        return redirect(url_for("login"))
    row = db_row("SELECT avatar FROM users WHERE username=?", current_user())
    return render_template(template,
                           username=current_user(),
                           user_image=avatar_url(row))

@app.route("/home")
def home(): return render_with_user("home.html")

@app.route("/profile")
def profile(): return render_with_user("profile.html")

# ────────────────────────── profile update API ─────────────────────
@app.route("/profile/update", methods=["POST"])
def update_profile():
    if not current_user():
        return jsonify(ok=False), 403

    conn, cur = sqlite3.connect(DB_URL), None
    try:
        cur = conn.cursor()

        # username change
        new_name = request.form.get("username", "").strip()
        if new_name and new_name != current_user():
            try:
                cur.execute("UPDATE users SET username=? WHERE username=?",
                            (new_name, current_user()))
                session["username"] = new_name
            except sqlite3.IntegrityError:
                return jsonify(ok=False, msg="Username already taken"), 409

        # avatar change
        if "avatar" in request.files and request.files["avatar"].filename:
            file = request.files["avatar"]
            ext  = os.path.splitext(file.filename)[1].lower()[:5] or ".png"
            fname = secure_filename(f"{uuid.uuid4().hex}{ext}")
            file.save(os.path.join(DATA_DIR, fname))
            cur.execute("UPDATE users SET avatar=? WHERE username=?",
                        (f"uploads/{fname}", current_user()))

        conn.commit()
    finally:
        if conn: conn.close()

    row = db_row("SELECT avatar FROM users WHERE username=?", current_user())
    return jsonify(ok=True,
                   username=current_user(),
                   avatar=avatar_url(row))

# ────────────────────────── exchanges API ──────────────────────────
@app.route("/get_exchanges")
def get_exchanges():
    df = pd.read_csv(CSV_PATH)
    out=[]
    for _, r in df.iterrows():
        assoc = [c.strip() for c in re.split(r"[;,]", str(r["Associated Countries"])) if c.strip()]
        out.append(dict(name=r["Stock Exchange"], host=r["Host Country"],
                        associated=assoc,
                        hostColor=r["Host Color"], assocColor=r["Associated Color"]))
    return jsonify(out)

# ────────────────────────── run app ────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
