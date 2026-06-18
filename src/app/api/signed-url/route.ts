export async function POST(request: Request) {
  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return Response.json(
        { error: "agentId requis" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Clé API ElevenLabs non configurée" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return Response.json(
        { error: `Erreur ElevenLabs: ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json({ signedUrl: data.signed_url });
  } catch (error) {
    return Response.json(
      { error: "Impossible d'obtenir l'URL signée" },
      { status: 500 }
    );
  }
}
