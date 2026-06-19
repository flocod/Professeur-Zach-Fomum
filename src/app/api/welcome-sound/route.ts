export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key missing" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "Un carillon doux et chaleureux en tonalite mineure, 2 secondes, style meditatif sacre, ambient lumineux",
        duration_seconds: 2.5,
        prompt_influence: 0.6,
      }),
    });

    if (!res.ok) {
      return Response.json({ error: "Generation echouee" }, { status: res.status });
    }

    const blob = await res.blob();
    return new Response(blob, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
