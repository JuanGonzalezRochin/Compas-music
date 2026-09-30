// Compás — shared helpers for entrar.html and app.html
(function () {
  const C = window.COMPAS_CONFIG;
  const sb = window.supabase.createClient(C.supabaseUrl, C.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  let lang = store.get("lang", (navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es");

  const T = {
    es: {
      "nav.home": "Inicio", "nav.logout": "Salir",
      "login.title": "Entra a tu cuenta", "login.sub": "Tus clases, tareas y práctica en un solo lugar.",
      "login.tabIn": "Iniciar sesión", "login.tabUp": "Crear cuenta",
      "f.email": "Correo", "f.password": "Contraseña", "f.password2": "Nueva contraseña", "f.name": "Nombre del alumno",
      "f.phone": "WhatsApp", "f.instrument": "Instrumento", "f.level": "Nivel", "f.minor": "El alumno es menor de edad",
      "f.guardian": "Nombre del padre, madre o tutor", "f.plan": "Plan",
      "lvl.0": "Nunca he tocado", "lvl.1": "Sé lo básico", "lvl.2": "Intermedio", "lvl.3": "Avanzado",
      "login.in": "Entrar", "login.up": "Crear cuenta", "login.forgot": "¿Olvidaste tu contraseña?",
      "login.reset": "Enviar enlace", "login.resetSent": "Te enviamos un enlace para cambiar tu contraseña.",
      "login.newPass": "Escribe tu nueva contraseña", "login.savePass": "Guardar contraseña", "login.passSaved": "Contraseña actualizada.",
      "login.checkEmail": "Revisa tu correo y abre el enlace para confirmar tu cuenta.",
      "login.minPass": "Mínimo 8 caracteres.", "login.back": "Volver",
      "err.generic": "Algo salió mal. Inténtalo de nuevo.", "err.badLogin": "Correo o contraseña incorrectos.",
      "err.required": "Completa los campos obligatorios.", "err.noProfile": "No encontramos tu perfil. Escríbenos para ayudarte.",
      "hello": "Hola, {n}", "role.student": "Alumno", "role.teacher": "Maestro", "role.admin": "Admin",
      "st.next": "Tu próxima clase", "st.noNext": "Aún no tienes clases agendadas. Tu maestro te agendará pronto.",
      "st.join": "Entrar al aula", "st.aulaSoon": "El aula virtual se activa en la siguiente actualización.",
      "st.homework": "Tus tareas", "st.noHomework": "No tienes tareas por ahora.", "st.upcoming": "Próximas clases",
      "st.week": "Práctica esta semana", "st.minutes": "min", "st.days": "días practicados", "st.recent": "Práctica reciente",
      "st.noPractice": "Registra tu primera práctica desde una tarea.",
      "hw.due": "Entrega {d}", "hw.overdue": "Vencida", "hw.target": "Meta ♩ = {b}", "hw.score": "Ver partitura",
      "hw.done": "Hecha", "hw.markDone": "Marcar como hecha", "hw.undo": "Deshacer", "hw.log": "Registrar práctica",
      "hw.reviewed": "Revisada", "hw.assigned": "Pendiente", "hw.feedback": "Comentario del maestro",
      "pl.minutes": "Minutos", "pl.bpm": "Tempo logrado (BPM)", "pl.note": "¿Cómo te fue?", "pl.file": "Audio o video (opcional)",
      "pl.save": "Guardar práctica", "pl.saved": "Práctica guardada. ¡Bien!", "pl.listen": "Escuchar",
      "t.students": "Alumnos", "t.lessons": "Clases", "t.scores": "Partituras", "t.admin": "Usuarios",
      "t.myStudents": "Mis alumnos", "t.search": "Buscar alumno", "t.add": "Agregar alumno", "t.addPick": "Elige un alumno",
      "t.noStudents": "Aún no tienes alumnos. Agrega uno con el botón de arriba.", "t.pickStudent": "Elige un alumno para ver su cuenta.",
      "t.contact": "Contacto", "t.guardian": "Tutor", "t.assign": "Asignar tarea", "t.hwTitle": "Tarea", "t.hwInstr": "Instrucciones",
      "t.hwBpm": "Tempo meta (BPM)", "t.hwDue": "Fecha de entrega", "t.hwScore": "Partitura", "t.none": "Ninguna",
      "t.assignBtn": "Asignar", "t.assigned": "Tarea asignada.", "t.hwList": "Tareas", "t.review": "Marcar revisada",
      "t.feedback": "Comentario para el alumno", "t.practice": "Práctica registrada", "t.notes": "Notas privadas",
      "t.notePh": "Solo tú puedes ver estas notas", "t.addNote": "Guardar nota", "t.remove": "Quitar de mis alumnos",
      "t.delete": "Eliminar", "t.savePlan": "Guardar",
      "l.new": "Agendar clase", "l.title": "Nombre de la clase", "l.format": "Tipo", "l.private": "Privada", "l.group": "Grupal",
      "l.trial": "Prueba gratis", "l.when": "Fecha y hora", "l.date": "Fecha", "l.time": "Hora", "l.duration": "Duración (min)", "l.students": "Alumnos",
      "l.save": "Agendar", "l.saved": "Clase agendada.", "l.upcoming": "Próximas clases", "l.past": "Clases pasadas",
      "l.none": "No hay clases agendadas.", "l.cancel": "Cancelar", "l.done": "Marcar dada", "l.cancelled": "Cancelada",
      "l.pickStudents": "Elige al menos un alumno.",
      "s.upload": "Subir partitura", "s.title": "Título", "s.composer": "Autor", "s.file": "Archivo (PDF, Guitar Pro o MusicXML)",
      "s.uploadBtn": "Subir", "s.uploaded": "Partitura guardada.", "s.none": "Tu biblioteca está vacía.", "s.open": "Abrir",
      "a.users": "Todas las cuentas", "a.role": "Rol", "a.saved": "Rol actualizado.",
      "saved": "Guardado.", "confirm": "¿Seguro?", "yes": "Sí", "no": "No",
      "sc.present": "Presentar en vivo", "sc.code": "Código de sala", "sc.copy": "Copiar enlace", "sc.copied": "Enlace copiado",
      "sc.live": "En vivo", "sc.connecting": "Conectando…", "sc.waiting": "Esperando a que el maestro abra la partitura…",
      "sc.follow": "Seguir al maestro", "sc.back": "Volver con el maestro (pág. {p})", "sc.page": "Página",
      "sc.move": "Mover", "sc.pen": "Lápiz", "sc.hl": "Resaltar", "sc.point": "Señalar", "sc.undo": "Deshacer", "sc.clear": "Borrar página",
      "sc.online": "{n} en la sala", "sc.teacherLeft": "El maestro salió de la sala.", "sc.notFound": "No encontramos esa partitura o no tienes acceso.",
      "sc.onlyPdf": "Por ahora el visor abre PDF. Guitar Pro y MusicXML llegan en una siguiente versión.",
      "sc.joinTitle": "¿Tu maestro te dio un código?", "sc.joinPh": "Código de sala", "sc.joinBtn": "Unirme", "sc.shareHint": "Manda este enlace a tus alumnos. Necesitan haber iniciado sesión.",
      "sc.exit": "Salir", "sc.prev": "Página anterior", "sc.next": "Página siguiente", "sc.zoomIn": "Acercar", "sc.zoomOut": "Alejar", "sc.fit": "Ajustar",
      "sc.teacher": "Maestro", "sc.you": "Tú",
      "metro.start": "Iniciar", "metro.stop": "Detener", "au.title": "Aula virtual", "au.tipHead": "Antes de empezar", "au.tip1": "Usa audífonos para que no haya eco.", "au.tip2": "Sonido original activado: tu instrumento se escucha tal cual.",
      "au.tip3": "Por internet siempre hay un pequeño retraso: toquen por turnos.", "au.join": "Entrar a la videollamada", "au.joining": "Conectando…",
      "au.tabScore": "Partitura", "au.tabMetro": "Metrónomo", "au.tabTuner": "Afinador", "au.pickScore": "Elige una partitura para mostrar",
      "au.noScore": "El maestro aún no ha abierto una partitura.", "au.noScores": "Sube partituras PDF en tu panel (Partituras) para mostrarlas aquí.",
      "au.share": "Compartir con la clase", "au.shared": "El maestro controla el metrónomo", "au.localMute": "Silenciar en mi dispositivo",
      "au.beats": "Tiempos por compás", "au.tunerStart": "Activar afinador", "au.tunerStop": "Detener", "au.tunerHint": "Toca una cuerda o una nota y mantenla.",
      "au.guitar": "Guitarra", "au.chromatic": "Cromático", "au.inTune": "Afinado", "au.low": "Bajo", "au.high": "Alto", "au.listening": "Escuchando…",
      "au.err.not_open": "El aula abre 15 minutos antes de la clase ({t}).", "au.err.no_access": "No tienes acceso a esta clase.",
      "au.err.cancelled": "Esta clase fue cancelada.", "au.err.missing_daily_key": "Falta configurar la clave de Daily en Supabase (DAILY_API_KEY).",
      "au.err.server": "El servidor del aula no respondió. Revisa que la función daily-room esté publicada en Supabase.", "au.err.noLesson": "Falta el enlace de la clase. Entra desde tu panel.",
      "au.openAula": "Abrir aula", "au.opensNote": "El aula abre 15 min antes.", "au.back": "Volver al panel",
    },
    en: {
      "nav.home": "Home", "nav.logout": "Log out",
      "login.title": "Sign in to your account", "login.sub": "Your lessons, homework and practice in one place.",
      "login.tabIn": "Sign in", "login.tabUp": "Create account",
      "f.email": "Email", "f.password": "Password", "f.password2": "New password", "f.name": "Student's name",
      "f.phone": "WhatsApp", "f.instrument": "Instrument", "f.level": "Level", "f.minor": "The student is under 18",
      "f.guardian": "Parent or guardian's name", "f.plan": "Plan",
      "lvl.0": "Never played", "lvl.1": "I know the basics", "lvl.2": "Intermediate", "lvl.3": "Advanced",
      "login.in": "Sign in", "login.up": "Create account", "login.forgot": "Forgot your password?",
      "login.reset": "Send link", "login.resetSent": "We sent you a link to reset your password.",
      "login.newPass": "Choose a new password", "login.savePass": "Save password", "login.passSaved": "Password updated.",
      "login.checkEmail": "Check your email and open the link to confirm your account.",
      "login.minPass": "At least 8 characters.", "login.back": "Back",
      "err.generic": "Something went wrong. Please try again.", "err.badLogin": "Wrong email or password.",
      "err.required": "Fill in the required fields.", "err.noProfile": "We couldn't find your profile. Contact us and we'll help.",
      "hello": "Hi, {n}", "role.student": "Student", "role.teacher": "Teacher", "role.admin": "Admin",
      "st.next": "Your next lesson", "st.noNext": "No lessons scheduled yet. Your teacher will book you soon.",
      "st.join": "Join lesson", "st.aulaSoon": "The virtual classroom turns on in the next update.",
      "st.homework": "Your homework", "st.noHomework": "No homework right now.", "st.upcoming": "Upcoming lessons",
      "st.week": "Practice this week", "st.minutes": "min", "st.days": "days practiced", "st.recent": "Recent practice",
      "st.noPractice": "Log your first practice from a homework task.",
      "hw.due": "Due {d}", "hw.overdue": "Overdue", "hw.target": "Target ♩ = {b}", "hw.score": "Open score",
      "hw.done": "Done", "hw.markDone": "Mark as done", "hw.undo": "Undo", "hw.log": "Log practice",
      "hw.reviewed": "Reviewed", "hw.assigned": "To do", "hw.feedback": "Teacher's comment",
      "pl.minutes": "Minutes", "pl.bpm": "Tempo reached (BPM)", "pl.note": "How did it go?", "pl.file": "Audio or video (optional)",
      "pl.save": "Save practice", "pl.saved": "Practice saved. Nice work!", "pl.listen": "Listen",
      "t.students": "Students", "t.lessons": "Lessons", "t.scores": "Scores", "t.admin": "Users",
      "t.myStudents": "My students", "t.search": "Search student", "t.add": "Add student", "t.addPick": "Pick a student",
      "t.noStudents": "No students yet. Add one with the button above.", "t.pickStudent": "Pick a student to see their account.",
      "t.contact": "Contact", "t.guardian": "Guardian", "t.assign": "Assign homework", "t.hwTitle": "Task", "t.hwInstr": "Instructions",
      "t.hwBpm": "Target tempo (BPM)", "t.hwDue": "Due date", "t.hwScore": "Score", "t.none": "None",
      "t.assignBtn": "Assign", "t.assigned": "Homework assigned.", "t.hwList": "Homework", "t.review": "Mark reviewed",
      "t.feedback": "Comment for the student", "t.practice": "Practice log", "t.notes": "Private notes",
      "t.notePh": "Only you can see these notes", "t.addNote": "Save note", "t.remove": "Remove from my students",
      "t.delete": "Delete", "t.savePlan": "Save",
      "l.new": "Schedule a lesson", "l.title": "Lesson name", "l.format": "Type", "l.private": "Private", "l.group": "Group",
      "l.trial": "Free trial", "l.when": "Date and time", "l.date": "Date", "l.time": "Time", "l.duration": "Length (min)", "l.students": "Students",
      "l.save": "Schedule", "l.saved": "Lesson scheduled.", "l.upcoming": "Upcoming lessons", "l.past": "Past lessons",
      "l.none": "No lessons scheduled.", "l.cancel": "Cancel", "l.done": "Mark taught", "l.cancelled": "Cancelled",
      "l.pickStudents": "Pick at least one student.",
      "s.upload": "Upload a score", "s.title": "Title", "s.composer": "Composer", "s.file": "File (PDF, Guitar Pro or MusicXML)",
      "s.uploadBtn": "Upload", "s.uploaded": "Score saved.", "s.none": "Your library is empty.", "s.open": "Open",
      "a.users": "All accounts", "a.role": "Role", "a.saved": "Role updated.",
      "saved": "Saved.", "confirm": "Are you sure?", "yes": "Yes", "no": "No",
      "sc.present": "Present live", "sc.code": "Room code", "sc.copy": "Copy link", "sc.copied": "Link copied",
      "sc.live": "Live", "sc.connecting": "Connecting…", "sc.waiting": "Waiting for the teacher to open the score…",
      "sc.follow": "Follow the teacher", "sc.back": "Back to the teacher (p. {p})", "sc.page": "Page",
      "sc.move": "Move", "sc.pen": "Pen", "sc.hl": "Highlight", "sc.point": "Point", "sc.undo": "Undo", "sc.clear": "Clear page",
      "sc.online": "{n} in the room", "sc.teacherLeft": "The teacher left the room.", "sc.notFound": "We couldn't find that score, or you don't have access.",
      "sc.onlyPdf": "For now the viewer opens PDFs. Guitar Pro and MusicXML come in a later version.",
      "sc.joinTitle": "Did your teacher give you a code?", "sc.joinPh": "Room code", "sc.joinBtn": "Join", "sc.shareHint": "Send this link to your students. They need to be logged in.",
      "sc.exit": "Leave", "sc.prev": "Previous page", "sc.next": "Next page", "sc.zoomIn": "Zoom in", "sc.zoomOut": "Zoom out", "sc.fit": "Fit",
      "sc.teacher": "Teacher", "sc.you": "You",
      "metro.start": "Start", "metro.stop": "Stop", "au.title": "Classroom", "au.tipHead": "Before you start", "au.tip1": "Use headphones so there's no echo.", "au.tip2": "Original sound is on: your instrument is heard as it really sounds.",
      "au.tip3": "The internet always adds a small delay: take turns playing.", "au.join": "Join the video call", "au.joining": "Connecting…",
      "au.tabScore": "Score", "au.tabMetro": "Metronome", "au.tabTuner": "Tuner", "au.pickScore": "Pick a score to show",
      "au.noScore": "The teacher hasn't opened a score yet.", "au.noScores": "Upload PDF scores in your dashboard (Scores) to show them here.",
      "au.share": "Share with the class", "au.shared": "The teacher controls the metronome", "au.localMute": "Mute on my device",
      "au.beats": "Beats per bar", "au.tunerStart": "Turn on tuner", "au.tunerStop": "Stop", "au.tunerHint": "Play a string or a note and let it ring.",
      "au.guitar": "Guitar", "au.chromatic": "Chromatic", "au.inTune": "In tune", "au.low": "Flat", "au.high": "Sharp", "au.listening": "Listening…",
      "au.err.not_open": "The classroom opens 15 minutes before the lesson ({t}).", "au.err.no_access": "You don't have access to this lesson.",
      "au.err.cancelled": "This lesson was cancelled.", "au.err.missing_daily_key": "The Daily key isn't set up in Supabase yet (DAILY_API_KEY).",
      "au.err.server": "The classroom server didn't respond. Check that the daily-room function is deployed in Supabase.", "au.err.noLesson": "The lesson link is missing. Join from your dashboard.",
      "au.openAula": "Open classroom", "au.opensNote": "Opens 15 min before.", "au.back": "Back to dashboard",
    },
  };

  const t = (k, vars) => {
    let s = (T[lang] && T[lang][k]) ?? T.es[k] ?? k;
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace("{" + a + "}", b);
    return s;
  };
  const loc = () => (lang === "es" ? "es-MX" : "en-US");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = (n) => (n || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const instName = (id) => { const i = C.instruments.find((x) => x.id === id); return i ? i[lang] : id || "—"; };
  const planName = (id) => { const p = C.plans.find((x) => x.id === id); return p ? p[lang] : id || "—"; };
  const fmtDateTime = (iso) => new Date(iso).toLocaleString(loc(), { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const fmtLongDateTime = (iso) => new Date(iso).toLocaleString(loc(), { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
  const fmtDate = (d) => new Date(d + (String(d).length === 10 ? "T12:00:00" : "")).toLocaleDateString(loc(), { weekday: "short", day: "numeric", month: "short" });

  let toastTimer;
  function toast(msg, bad) {
    let el = document.getElementById("toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.setAttribute("role", "status"); document.body.append(el); }
    el.className = "toast" + (bad ? " bad" : ""); el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 3200);
  }
  function fail(err) { console.error(err); toast((err && err.message) || t("err.generic"), true); }

  function applyStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    document.querySelectorAll(".brand-name").forEach((el) => (el.textContent = C.brand));
  }
  function bindLang(onChange) {
    document.querySelectorAll("[data-lang]").forEach((b) =>
      b.addEventListener("click", () => { lang = b.dataset.lang; store.set("lang", lang); applyStatic(); onChange && onChange(); }));
  }

  async function signedUrl(bucket, path, secs = 3600) {
    const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, secs);
    if (error) throw error;
    return data.signedUrl;
  }
  const safeName = (n) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);

  window.Compas = {
    C, sb, t, get lang() { return lang; }, loc, esc, initials, instName, planName,
    fmtDateTime, fmtLongDateTime, fmtDate, toast, fail, applyStatic, bindLang, signedUrl, safeName, store,
  };
})();
