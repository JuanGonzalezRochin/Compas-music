# Compás Music Academy — website

Static site for GitHub Pages + Supabase (accounts, homework) + Web3Forms (trial-booking emails).

## Files
| File | What it is |
| --- | --- |
| `index.html` | Landing page (plans, free-lesson booking) |
| `entrar.html` | Log in / create account / reset password |
| `partitura.html` | Shared score viewer (PDF.js): the teacher presents a PDF live, students follow page turns, pen marks and pointer |
| `aula.html` | Virtual classroom: free direct video (music audio) + shared score + shared metronome + tuner |
| `supabase/functions/daily-room/index.ts` | Only for the optional Daily.co backup video |
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

## Test the shared score (PDF)
1. Log in as admin/teacher → **Partituras** → upload any PDF score.
2. Click **● Presentar en vivo**. You'll see a 6-letter room code and a link.
3. Open the link in a private window (or another device) logged in as a student, or have the student type the code in **"¿Tu maestro te dio un código?"** on their dashboard.
4. Turn pages, draw with the pen, highlight, or use **Señalar** to point: the student sees it instantly.
   The student can untick **Seguir al maestro** to look ahead and tap the orange button to jump back.
5. Attach the score to a homework task and the student can open it from their dashboard later.

If the room stays on "Conectando…": Supabase → **Project Settings → Realtime** → make sure public channel access is allowed.

## Video classroom
The classroom uses **direct video between browsers** (WebRTC peer-to-peer): 100% free, no card, no extra account.
Supabase Realtime (already set up) only introduces the browsers to each other; video and audio then travel directly between them.
- Music audio: stereo Opus at 256 kbps, no noise suppression / echo cancellation / auto-gain.
- **Modo voz** button: turns echo cancellation on for someone without headphones (instrument sounds less natural).
- Buttons: mic, camera, screen share, device picker (mic/camera, e.g. an audio interface), leave.
- Best for private lessons and small groups (up to 4–5 people).
- About 1 in 10 people on very strict networks (company/school/some mobile data) may not connect. They can switch to home Wi-Fi, or you can add a relay (TURN) server later in `config.js` → `turnServers`.

**Backup: Daily.co.** Set `videoMode: "daily"` in `config.js` to switch. That needs the `daily-room` function (`supabase/functions/daily-room/index.ts`, secret `DAILY_API_KEY`, "Verify JWT" off) and a card on your Daily account.

### Test a class
1. As teacher/admin: dashboard → **Clases** → schedule a lesson starting now with your test student.
2. Click **Abrir aula** → **Entrar a la videollamada**. Allow camera and microphone.
3. On another device (phone or a private window), log in as the student → **Entrar al aula** on the next-lesson card.
4. Both wear headphones. Play a few notes: long notes should ring without fading (music audio mode).
5. Right panel: pick a PDF in **Partitura** (the student follows your pages), start the **Metrónomo** (it starts on the student's device too), try the **Afinador**.

Students can enter from 15 minutes before the lesson until 30 minutes after it ends; teachers anytime.

## Booking emails (Web3Forms, free: 250/month)
1. https://web3forms.com → free account with gonz.roch@gmail.com → copy the Access Key.
2. In `index.html` set `web3formsKey: "your-key"` and upload again.

## Video on the landing page
Put an MP4 at `videos/estudiantes.mp4` (horizontal, 10–20 s, no audio needed, under ~8 MB). It plays muted and looped under the hero, with a pause button.
Until the file exists, the page shows the guitar image with a small "Espacio para video" label.
Free footage with commercial use and no attribution: Pexels, Pixabay, Mixkit, Coverr (always check the clip's license page).

## Images
Replace `images/guitar.webp` / `images/piano.webp` with your own photos (same names), landscape, ≥1600 px wide, <300 KB.

## Security
- Safe to be public: Supabase URL, publishable key (`sb_publishable_…`), Web3Forms key.
- Never in code or chat: Supabase secret key (`sb_secret_…`), database password, Daily API key.
- The database rules were tested: students only see their own lessons, homework and practice; teachers see their students; only an admin can change roles.

## Next
Lesson recording, saved to the student's account.
