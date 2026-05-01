export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 🔧 Fix body parsing (important for Vercel)
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, email, subject, message } = body;

    // 🔍 Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🚀 Send request to EmailJS
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          name,
          email,
          subject,
          message
        }
      })
    });

    // 🔥 Get FULL response (IMPORTANT)
    const resultText = await response.text();
    console.log("EmailJS response:", resultText);

    // ❌ If EmailJS failed → show exact error
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