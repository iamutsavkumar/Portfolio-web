export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 🔧 Parse body (Vercel safe)
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { name, email, subject, message, token } = body;

    // 🔍 Validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // 🔐 reCAPTCHA verification (IMPORTANT)
    if (!token) {
      return res.status(400).json({ success: false, error: "Missing reCAPTCHA token" });
    }

    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      return res.status(400).json({
        success: false,
        error: "reCAPTCHA verification failed"
      });
    }

    // 🚀 Send Email via EmailJS
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          name,
          email,
          subject,
          message
        }
      })
    });

    const resultText = await response.text();
    console.log("EmailJS response:", resultText);

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: resultText
      });
    }

    // ✅ Success
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Server error:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}