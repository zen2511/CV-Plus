import { NextRequest, NextResponse } from "next/server";
import { uploadCv } from "@/lib/storage";

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Seuls les fichiers PDF sont acceptés." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Le fichier dépasse 5 Mo." },
      { status: 400 }
    );
  }

  const buffer = await file.arrayBuffer();
  const key = await uploadCv(buffer);

  return NextResponse.json({ key });
}