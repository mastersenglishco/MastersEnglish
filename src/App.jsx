import React, { useMemo, useState } from "react";

/**
 * Masters English — Pricing & Application (Formspree wired)
 *
 * UX flow:
 * 1) pick a course type
 * 2) pick a package
 * 3) confirm details
 * 4) submit an application (POST → Formspree)
 */

// Course types shown in Step 1
const COURSE_TYPES = [
  {
    id: "main",
    title: "Main Course",
    subtitle: "50–60 minutes per lesson",
    description:
      "Structured lessons covering grammar, vocabulary, reading, listening, and guided speaking.",
  },
  {
    id: "conv",
    title: "Conversational",
    subtitle: "30–40 minutes per lesson",
    description:
      "Speaking-focused sessions to improve fluency, confidence, and natural expression.",
  },
  {
    id: "placement",
    title: "Free Placement Test",
    subtitle: "60–90 minutes (one-time)",
    description:
      "A short evaluation call to check your level and recommend the best course + package.",
    },
    {
    id: "trial",
    title: "Free Trial",
    subtitle: "15–30 minutes (one-time)",
    description:
      "A short trial session to introduce the class style, discuss your goals, and recommend the best next step.",
  },
];

// Packages are grouped per course type
// Currency config
const CURRENCIES = {
  USD: { label: "USD", symbol: "$" },
  KWD: { label: "KWD", symbol: "KWD " },
};

// Packages are grouped per course type (prices mapped per currency)
const PACKAGES = {
  main: [
    { id: "m1", lessons: 1, price: { USD: 15, KWD: 5 }, title: "Quick Start", per: { USD: "$15 per lesson", KWD: "5 KWD per lesson" } },
    { id: "m10", lessons: 10, price: { USD: 140, KWD: 45 }, title: "Starter Pack", per: { USD: "$14 per lesson", KWD: "4.5 KWD per lesson" } },
    { id: "m20", lessons: 20, price: { USD: 260, KWD: 80 }, title: "Momentum Month", per: { USD: "$13 per lesson", KWD: "4 KWD per lesson" } },
    { id: "m40", lessons: 40, price: { USD: 480, KWD: 150 }, title: "Consistency Plan", per: { USD: "$12 per lesson", KWD: "3.75 KWD per lesson" } },
    { id: "m80", lessons: 80, price: { USD: 880, KWD: 270 }, title: "Full Level Journey", per: { USD: "$11 per lesson", KWD: "3.4 KWD per lesson" } },
  ],
  conv: [
    { id: "c1", lessons: 1, price: { USD: 10, KWD: 3 }, title: "Warm-Up Chat", per: { USD: "$10 per lesson", KWD: "3 KWD per lesson" } },
    { id: "c10", lessons: 10, price: { USD: 90, KWD: 28 }, title: "Fluency Starter", per: { USD: "$9 per lesson", KWD: "2.8 KWD per lesson" } },
    { id: "c20", lessons: 20, price: { USD: 160, KWD: 50 }, title: "Talk-a-Lot Plan", per: { USD: "$8 per lesson", KWD: "2.5 KWD per lesson" } },
    { id: "c40", lessons: 40, price: { USD: 280, KWD: 86 }, title: "Conversation Pro", per: { USD: "$7 per lesson", KWD: "2.15 KWD per lesson" } },
  ],
  placement: [
    { id: "p1", lessons: 1, price: { USD: 0, KWD: 0 }, title: "Book a Free Placement Test", per: { USD: "Free (one-time)", KWD: "Free (one-time)" } },
  ],
  trial: [
    { id: "t1", lessons: 1, price: { USD: 0, KWD: 0 }, title: "Book a Free Trial", per: { USD: "Free (one-time)", KWD: "Free (one-time)" } },
  ],
};

// ✅ Your Formspree endpoint (submissions will arrive in your Formspree inbox + email, depending on your settings)
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xanrzowg";

/**
 * Small presentational components
 * Keeping them simple makes the main App component easier to read.
 */
function Badge({ children, className = "" }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

/**
 * Button defaults to type="button" to avoid accidental form submission.
 * If you want a submit button, pass type="submit".
 */
function Button({ children, onClick, type = "button", variant = "primary", disabled }) {
  return (
    <button type={type} onClick={onClick} className={`btn ${variant}`} disabled={disabled}>
      {children}
    </button>
  );
}

/**
 * Field is a controlled input:
 * - `value` comes from state
 * - `onChange` updates state
 * This avoids the classic “can’t type” bug from uncontrolled/controlled switching.
 */
function Field({ label, value, onChange, placeholder, type = "text", required, name }) {
  return (
    <label className="field">
      <span className="label">
        {label} {required ? <span className="req">*</span> : null}
      </span>
      <input
        className="input"
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

export default function App() {
  /**
   * Step state controls which screen is shown.
   * This is a lightweight alternative to routing for a small prototype.
   */
  const [step, setStep] = useState("type");

  // User’s selections
  const [typeId, setTypeId] = useState(null);
  const [packageId, setPackageId] = useState(null);

  // Currency (chosen from the beginning)
  const [currency, setCurrency] = useState("USD");

  /**
   * Derived selections:
   * useMemo prevents re-finding objects on every render unless dependencies change.
   */
  const selectedType = useMemo(
    () => COURSE_TYPES.find((t) => t.id === typeId) || null,
    [typeId]
  );

  const selectedPackage = useMemo(() => {
    if (!typeId) return null;
    return PACKAGES[typeId].find((p) => p.id === packageId) || null;
  }, [typeId, packageId]);

  // Currency helpers
  const safeCurrency = CURRENCIES[currency] ? currency : "USD";
  const money = (amount) => `${CURRENCIES[safeCurrency].symbol}${amount}`;

  const pkgTotal = (pkg) => {
    if (!pkg) return "";
    const amount = pkg.price?.[safeCurrency] ?? pkg.price?.USD ?? 0;
    if (amount === 0) return "Free";
    return money(amount);
  };

  const pkgPer = (pkg) => {
    if (!pkg) return "";
    const perStr = pkg.per?.[safeCurrency];
    if (perStr) return perStr;
    const amount = pkg.price?.[safeCurrency] ?? pkg.price?.USD ?? 0;
    const per = pkg.lessons ? amount / pkg.lessons : amount;
    const rounded = Number.isFinite(per) ? Math.round(per * 100) / 100 : per;
    return safeCurrency === "USD" ? `${CURRENCIES[safeCurrency].symbol}${rounded} per lesson` : `${rounded} KWD per lesson`;
  };

  // Form data (controlled fields)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    // Required for Free Trial / Placement Test / Single lessons
    preferredDate: "",
    preferredTime: "",
  });

  // Basic submit state to improve UX
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | "success" | "error"
  const [submitMessage, setSubmitMessage] = useState("");

  /**
   * Simple validation gate:
   * - prevents empty sends
   * - disables submit button until form is ready
   */
  const needsSchedule =
    // Free options
    selectedType?.id === "trial" ||
    selectedType?.id === "placement" ||
    // Paid single lessons (the 1-lesson options in Main/Conversational)
    selectedPackage?.lessons === 1;

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.country.trim() &&
    (!needsSchedule || (formData.preferredDate.trim() && formData.preferredTime.trim()));

  // Reset everything back to Step 1
  const reset = () => {
    setStep("type");
    setTypeId(null);
    setPackageId(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      country: "",
      preferredDate: "",
      preferredTime: "",
    });
    setIsSubmitting(false);
    setSubmitStatus(null);
    setSubmitMessage("");
  };

  // Label for the header badge (small UX cue)
  const stepLabel =
    step === "type"
      ? "Choose a course"
      : step === "packages"
      ? "Choose a package"
      : step === "details"
      ? "Package details"
      : "Apply";

  /**
   * Submit handler:
   * Sends a POST request to Formspree.
   * We include both the user info AND what they selected (course + package).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: should never happen because the UI only shows Step 4 with selections,
    // but it keeps the function safe.
    if (!selectedType || !selectedPackage) return;

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    try {
      // Formspree accepts JSON if you set the Accept header.
      // You can also submit as FormData; JSON is cleaner here.
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        preferredDate: needsSchedule ? formData.preferredDate : "",
        preferredTime: needsSchedule ? formData.preferredTime : "",

        // Extra context (very useful in the email you receive)
        courseType: selectedType.title,
        courseTypeId: selectedType.id,
        packageTitle: selectedPackage.title,
        packageId: selectedPackage.id,
        lessons: selectedPackage.lessons,
        currency: safeCurrency,
        totalPrice: selectedPackage.price?.[safeCurrency] ?? selectedPackage.price?.USD ?? 0,
        displayTotalPrice: pkgTotal(selectedPackage),
        displayPricePerLesson: pkgPer(selectedPackage),
      };

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Formspree returns JSON responses.
      // `res.ok` covers 2xx status codes.
      if (!res.ok) {
        // Try to read Formspree’s JSON error (if available)
        let errText = "Submission failed. Please try again.";
        try {
          const data = await res.json();
          if (data?.errors?.length) errText = data.errors[0].message || errText;
        } catch {
          // ignore JSON parsing failures
        }
        throw new Error(errText);
      }

      setSubmitStatus("success");
      setSubmitMessage("Submitted! We will contact you by email with the next steps.");

      // Optional: keep user on the page with a confirmation state.
      // If you prefer to go back to Step 1 after submit, call reset() instead.
      // reset();
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMessage(err?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      {/* Inline CSS for a standalone prototype */}
      <style>{css}</style>

      {/* Top header */}
      <header className="topbar">
        <div className="wrap topbarInner">
          {/* Brand button resets the flow */}
          <button className="brand" onClick={reset} aria-label="Go to home">
            <div className="brandName">Masters English</div>
            <div className="brandSub">English Academy</div>
          </button>
          
        </div>
      </header>

      <main className="wrap">
        <div className="hero">
          <h1>Pricing & Packages</h1>
          <p>Choose a currency → choose a course type → choose a package → apply.</p>

          <div className="currencyPicker" aria-label="Choose currency">
            <span className="currencyLabel">Currency:</span>
            <button
              type="button"
              className={`curBtn ${safeCurrency === "USD" ? "active" : ""}`}
              onClick={() => setCurrency("USD")}
            >
              USD
            </button>
            <button
              type="button"
              className={`curBtn ${safeCurrency === "KWD" ? "active" : ""}`}
              onClick={() => setCurrency("KWD")}
            >
              KWD
            </button>
          </div>
        </div>

        {/* STEP 1: Choose course type */}
        {step === "type" && (
          <div className="grid3 fit">
            {COURSE_TYPES.map((t) => (
              <Card key={t.id}>
                <div className="cardHead">
                  <div>
                    <div className="kicker">Course option</div>
                    <div className="title">{t.title}</div>
                    <div className="sub">{t.subtitle}</div>
                  </div>
                  <Badge>Step 1</Badge>
                </div>

                <div className="desc">{t.description}</div>

                <div className="row">
                  <Button
                    onClick={() => {
                      setTypeId(t.id);
                      setPackageId(null);
                      setStep("packages");
                    }}
                  >
                    View packages
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* STEP 2: Choose package */}
        {step === "packages" && selectedType && (
          <>
            <div className="sectionHead">
              <div>
                <div className="kicker">{selectedType.title}</div>
                <h2>Choose your package</h2>
              </div>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setPackageId(null);
                  setStep("type");
                }}
              >
                Back
              </Button>
            </div>

            <div className="grid3">
              {PACKAGES[selectedType.id].map((p) => (
                <Card key={p.id}>
                  <div className="cardHead">
                    <div>
                      <div className="kicker">{selectedType.title}</div>
                      <div className="title">{p.title}</div>
                      <div className="sub">{pkgPer(p)}</div>
                    </div>
                    <Badge className="price">{pkgTotal(p)}</Badge>
                  </div>

                  <div className="pillRow">
                    <span className="pill">
                      {p.lessons} lesson{p.lessons === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="row">
                    <Button
                      onClick={() => {
                        setPackageId(p.id);
                        setStep("details");
                      }}
                    >
                      View details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* STEP 3: Package details */}
        {step === "details" && selectedType && selectedPackage && (
          <div className="grid2 fit">
            <Card>
              <div className="cardHead">
                <div>
                  <div className="kicker">{selectedType.title}</div>
                  <div className="title">{selectedPackage.title}</div>
                  <div className="sub">{pkgPer(selectedPackage)}</div>
                </div>
                <Badge className="price">{pkgTotal(selectedPackage)}</Badge>
              </div>

              <div className="detailBox">
                <div className="detailTitle">What you selected</div>
                <div className="detailText">
                  {selectedPackage.lessons} lesson{selectedPackage.lessons === 1 ? "" : "s"} •{" "}
                  {selectedType.subtitle}
                </div>
              </div>

              <div className="row">
                <Button variant="ghost" type="button" onClick={() => setStep("packages")}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep("apply")}>
                  Apply now
                </Button>
              </div>
            </Card>

            <Card>
              <div className="title" style={{ marginBottom: 6 }}>
                How it works
              </div>
              <ol className="list">
                <li>Apply for a course</li>
                <li>We contact you</li>
                <li>Start learning</li>
              </ol>
            </Card>
          </div>
        )}

        {/* STEP 4: Application form (POST → Formspree) */}
        {step === "apply" && selectedType && selectedPackage && (
          <div className="grid2 fit">
            <Card>
              <div className="cardHead">
                <div>
                  <div className="kicker">Applying for</div>
                  <div className="title">
                    {selectedType.title} • {selectedPackage.title}
                  </div>
                  <div className="sub">
                    {selectedPackage.lessons} lesson{selectedPackage.lessons === 1 ? "" : "s"} •{" "}
                    {pkgTotal(selectedPackage)}
                  </div>
                </div>
                <Badge>Step 4</Badge>
              </div>

              {/*
                We use a React submit handler so we can:
                - show loading state
                - show success/error message
                - include extra selection data in the submission
              */}
              <form className="form" onSubmit={handleSubmit}>
                <div className="grid2small">
                  <Field
                    label="Full name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(v) => setFormData((d) => ({ ...d, fullName: v }))}
                    placeholder="Your full name"
                    required
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(v) => setFormData((d) => ({ ...d, email: v }))}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="grid2small">
                  <Field
                    label="Phone number"
                    name="phone"
                    value={formData.phone}
                    onChange={(v) => setFormData((d) => ({ ...d, phone: v }))}
                    placeholder="+49 ..."
                    required
                  />
                  <Field
                    label="Country of residence"
                    name="country"
                    value={formData.country}
                    onChange={(v) => setFormData((d) => ({ ...d, country: v }))}
                    placeholder="Germany"
                    required
                  />
                </div>

                {/* Only for Free Trial / Placement Test / Single lessons */}
                {needsSchedule && (
                  <div className="detailBox" style={{ marginTop: 4 }}>
                    <div className="detailTitle">Preferred date & time</div>
                    <div className="grid2small" style={{ marginTop: 10 }}>
                      <Field
                        label="Preferred date"
                        name="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(v) => setFormData((d) => ({ ...d, preferredDate: v }))}
                        required
                      />
                      <Field
                        label="Preferred time"
                        name="preferredTime"
                        type="time"
                        value={formData.preferredTime}
                        onChange={(v) => setFormData((d) => ({ ...d, preferredTime: v }))}
                        required
                      />
                    </div>
                    <div className="sub" style={{ marginTop: 8 }}>
                      We’ll confirm the exact time by email.
                    </div>
                  </div>
                )}

                {/* Submission feedback */}
                {submitStatus && (
                  <div
                    className={`notice ${submitStatus === "success" ? "ok" : "bad"}`}
                    role="status"
                    aria-live="polite"
                  >
                    {submitMessage}
                  </div>
                )}

                <div className="row">
                  <Button variant="ghost" type="button" onClick={() => setStep("details")}>
                    Back
                  </Button>
                  <Button type="submit" disabled={!isFormValid || isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit application"}
                  </Button>
                </div>
              </form>
            </Card>

            {/* A small summary card helps reduce mistakes and increases trust */}
            <Card>
              <div className="title" style={{ marginBottom: 6 }}>
                Next step
              </div>
              <div className="desc">You will receive a confirmation email with the next steps.</div>

              <div className="detailBox" style={{ marginTop: 14 }}>
                <div className="detailTitle">Your selection</div>
                <div className="detailText" style={{ marginTop: 8 }}>
                  <div>
                    <strong>Course:</strong> {selectedType.title}
                  </div>
                  <div>
                    <strong>Package:</strong> {selectedPackage.title}
                  </div>
                  <div>
                    <strong>Lessons:</strong> {selectedPackage.lessons}
                  </div>
                  <div>
                    <strong>Total price:</strong> {pkgTotal(selectedPackage)}
                  </div>
                  {needsSchedule && (
                    <>
                      <div>
                        <strong>Preferred date:</strong> {formData.preferredDate || "—"}
                      </div>
                      <div>
                        <strong>Preferred time:</strong> {formData.preferredTime || "—"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="wrap">© {new Date().getFullYear()} Masters English Academy</div>
      </footer>
    </div>
  );
}

/**
 * Plain CSS (no Tailwind)
 * Keeping everything in one file makes it easy to copy/paste or deploy quickly.
 */
const css = `
  :root{
    --bg:#f8fafc;
    --card:#ffffff;
    --text:#0f172a;
    --muted:#475569;
    --border:#e2e8f0;
    --soft:#f1f5f9;
    --shadow: 0 10px 30px rgba(15, 23, 42, .06);
  }
  *{ box-sizing:border-box; }
  body{
    margin:0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    color:var(--text);
    background:var(--bg);
  }

  .page{ min-height:100vh; }

  /* Overall page width (desktop-friendly: reduces the big side “empty space”) */
  .wrap{ max-width: 1200px; margin:0 auto; padding: 28px; }

  @media (min-width: 1100px){
    .wrap{ padding: 32px; }
  }

  /* Sticky header */
  .topbar{
    position:sticky;
    top:0;
    z-index:10;
    background: rgba(255,255,255,.88);
    backdrop-filter: blur(10px);
    border-bottom:1px solid var(--border);
  }
  .topbarInner{ display:flex; align-items:center; justify-content:space-between; gap:12px; }

  .brand{
    border:none;
    background:transparent;
    cursor:pointer;
    text-align:left;
    padding:8px 10px;
    border-radius:14px;
  }
  .brand:hover{ background:var(--soft); }
  .brandName{ font-weight:900; letter-spacing:-.02em; color:#000; }
  .brandSub{ font-size:12px; color:#6b7280; margin-top:2px; }

  .badge{
    display:inline-flex;
    align-items:center;
    padding:6px 10px;
    border-radius:999px;
    border:1px solid var(--border);
    background:#fff;
    font-size:12px;
    color:#334155;
    font-weight:700;
    white-space:nowrap;
  }
  .badge.price{
    background:#0f172a;
    color:#fff;
    border-color:#0f172a;
    font-weight:900;
  }

  .hero{ padding: 10px 0 18px; }
  h1{ margin:0; font-size:34px; letter-spacing:-.03em; }
  h2{ margin:6px 0 0; font-size:22px; letter-spacing:-.02em; }
  .hero p{ margin:8px 0 0; color:var(--muted); }

  .currencyPicker{
    margin-top:14px;
    display:flex;
    align-items:center;
    gap:10px;
    flex-wrap:wrap;
  }
  .currencyLabel{ font-weight:900; font-size:13px; color:#334155; }
  .curBtn{
    border:1px solid #000;
    background:#fff;
    color:#000;
    border-radius:999px;
    padding:8px 12px;
    font-weight:900;
    cursor:pointer;
  }
  .curBtn:hover{ background:#f1f5f9; }
  .curBtn.active{
    background:#000;
    color:#fff;
    border-color:#000;
  }
  .curBtn:hover{ background:var(--soft); }
  .curBtn.active{
    background:#0f172a;
    color:#fff;
    border-color:#0f172a;
  }

  .card{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:18px;
    padding:18px;
    box-shadow: var(--shadow);
    min-width: 0;
  }

  .cardHead{
    display:flex;
    justify-content:space-between;
    gap:12px;
    align-items:flex-start;
  }
  .kicker{ font-size:12px; color:#64748b; font-weight:800; }
  .title{ margin-top:6px; font-size:18px; font-weight:900; letter-spacing:-.02em; }
  .sub{ margin-top:6px; font-size:13px; color:var(--muted); }
  .desc{ margin-top:12px; color:#334155; font-size:14px; line-height:1.55; }

  .row{ display:flex; gap:10px; margin-top:16px; flex-wrap:wrap; }

  .btn{
    border:none;
    cursor:pointer;
    font-weight:800;
    border-radius:14px;
    padding:10px 14px;
    transition: transform .05s ease, background .15s ease;
  }
  .btn:active{ transform: scale(.99); }
  .btn.primary{ background:#0f172a; color:#fff; }
  .btn.primary:hover{ background:#111c33; }
  .btn.ghost{ background:#fff; border:1px solid var(--border); color:#0f172a; }
  .btn.ghost:hover{ background:var(--soft); }
  .btn:disabled{ opacity:.6; cursor:not-allowed; }

  /* “fit”: allow wider desktop layout (no huge empty margins) */
  .fit{ max-width: 1200px; margin: 0 auto; }

  .grid2{ display:grid; grid-template-columns: 1fr; gap:16px; }
  .grid3{ display:grid; grid-template-columns: 1fr; gap:16px; }
  .grid2small{ display:grid; grid-template-columns: 1fr; gap:12px; }

  @media (min-width: 860px){
    .grid2{ grid-template-columns: 1fr 1fr; }
    .grid3{ grid-template-columns: 1fr 1fr 1fr; }
    .grid2small{ grid-template-columns: 1fr 1fr; }
  }

  .pillRow{ margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; }
  .pill{
    border:1px solid var(--border);
    background:#f8fafc;
    padding:6px 10px;
    border-radius:999px;
    font-size:12px;
    color:#334155;
    font-weight:800;
  }

  .sectionHead{
    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    gap:12px;
    margin-top:18px;
    margin-bottom:10px;
  }

  .detailBox{
    margin-top:14px;
    border:1px solid var(--border);
    background:#f8fafc;
    border-radius:16px;
    padding:14px;
  }
  .detailTitle{ font-weight:900; font-size:13px; }
  .detailText{ margin-top:6px; color:#334155; font-size:14px; }

  .list{ margin:12px 0 0; padding-left:18px; color:#334155; line-height:1.7; }

  .form{ margin-top:16px; display:grid; gap:12px; }
  .field{ display:block; }
  .label{ display:block; font-weight:800; font-size:12px; color:#334155; margin-bottom:6px; }
  .req{ color:#94a3b8; font-weight:900; }

  /* Input text is black while typing (requested UX tweak) */
  .input{
    width:100%;
    border:1px solid var(--border);
    border-radius:14px;
    padding:10px 12px;
    outline:none;
    font-size:14px;
    background:#fff;
    color:#000;
  }
  .input::placeholder{ color:#94a3b8; }
  .input:focus{ border-color:#94a3b8; }

  /* Inline success/error message */
  .notice{
    border:1px solid var(--border);
    border-radius:14px;
    padding:10px 12px;
    font-size:13px;
    line-height:1.4;
  }
  .notice.ok{ background:#f0fdf4; border-color:#86efac; color:#14532d; }
  .notice.bad{ background:#fef2f2; border-color:#fecaca; color:#7f1d1d; }

  .footer{ border-top:1px solid var(--border); background:#fff; color:#64748b; }
`;


