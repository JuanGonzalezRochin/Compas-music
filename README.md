# Compás Music Academy — website

Static site for GitHub Pages + Supabase (accounts, homework) + Web3Forms (trial-booking emails).

## Files
| File | What it is |
| --- | --- |
| `index.html` | Landing page (plans, free-lesson booking) |
| `entrar.html` | Log in / create account / reset password |
| `app.html` | Dashboard: students see lessons, homework, practice; teachers manage students, lessons, scores |
| `config.js` | Public settings (Supabase URL + publishable key). Never put secret keys here. |
| `common.js`, `app.css` | Shared code and styles |
| `images/` | Background artwork |
| `supabase/01_setup.sql` | Creates the database (run once) |
| `supabase/02_make_me_admin.sql` | Makes your account the admin (run after you sign up) |

## Make it work (about 15 minutes)

### 1. Create the database
1. Supabase → your project → **SQL Editor** → **New query**.
2. Open `supabase/01_setup.sql`, copy everything, paste, click **Run**. You should see "Success. No rows returned".

### 2. Upload the site to GitHub
Upload **all** files and folders above to the root of the `Compas-music` repository (replace the old `index.html`).
Wait ~1 minute, then open https://juangonzalezrochin.github.io/Compas-music/

### 3. Check the login settings
Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://juangonzalezrochin.github.io/Compas-music/`
- **Redirect URLs:** add `https://juangonzalezrochin.github.io/Compas-music/**`

### 4. Create your admin account
1. On the site click **Entrar** → **Crear cuenta**, sign up with gonz.roch@gmail.com, and confirm the email Supabase sends you.
2. Supabase → SQL Editor → run `supabase/02_make_me_admin.sql`.
3. Refresh the dashboard. You now see the teacher tabs plus **Usuarios**, where you can turn other accounts into teachers.

### 5. Test as a student
Create a second account with another email (or a private browser window); it becomes a student automatically.
As admin: assign homework and schedule a lesson with that student. Log in as the student: you'll see the lesson and homework, and can log practice.

Note: Supabase's built-in email sender only sends a few emails per hour, which is fine for testing. Before launch, connect a free email provider (e.g. Resend) in **Authentication → Emails → SMTP**.

## Booking emails (Web3Forms, free: 250/month)
1. https://web3forms.com → free account with gonz.roch@gmail.com → copy the Access Key.
2. In `index.html` set `web3formsKey: "your-key"` and upload again.

## Images
Replace `images/guitar.webp` / `images/piano.webp` with your own photos (same names), landscape, ≥1600 px wide, <300 KB.

## Security
- Safe to be public: Supabase URL, publishable key (`sb_publishable_…`), Web3Forms key.
- Never in code or chat: Supabase secret key (`sb_secret_…`), database password, Daily API key.
- The database rules were tested: students only see their own lessons, homework and practice; teachers see their students; only an admin can change roles.

## Next
Step 2: the virtual classroom (`aula.html`): Daily video with music audio mode, metronome, tuner; then shared scores and recording.
