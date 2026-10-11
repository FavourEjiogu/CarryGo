export type CarryGoShareCardInput = {
  title: string;
  status: string;
  pickup: string;
  destination: string;
  url: string;
};

const WIDTH = 1200;
const HEIGHT = 630;

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function cleanText(value: string, max = 220): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = cleanText(text).split(" ").filter(Boolean);
  let line = "";
  let linesDrawn = 0;

  while (words.length > 0) {
    const word = words.shift()!;
    const candidate = line ? line + " " + word : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      if (linesDrawn === maxLines - 1) {
        let finalLine = (line + " " + word).trim();
        while (finalLine.length > 1 && context.measureText(finalLine + "…").width > maxWidth) {
          finalLine = finalLine.slice(0, -1);
        }
        context.fillText(finalLine + "…", x, y + linesDrawn * lineHeight);
        return maxLines;
      }
      context.fillText(line, x, y + linesDrawn * lineHeight);
      linesDrawn += 1;
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line && linesDrawn < maxLines) {
    let finalLine = line;
    if (context.measureText(finalLine).width > maxWidth) {
      while (finalLine.length > 1 && context.measureText(finalLine + "…").width > maxWidth) {
        finalLine = finalLine.slice(0, -1);
      }
      finalLine += "…";
    }
    context.fillText(finalLine, x, y + linesDrawn * lineHeight);
    linesDrawn += 1;
  }
  return linesDrawn;
}
function fitUrl(context: CanvasRenderingContext2D, url: string, maxWidth: number): string {
  let value = cleanText(url, 180);
  while (value.length > 16 && context.measureText(value).width > maxWidth) {
    value = value.slice(0, -5) + "…";
  }
  return value;
}

export async function downloadCarryGoStatusCard(input: CarryGoShareCardInput): Promise<void> {
  if (typeof document === "undefined") throw new Error("Image download is only available in a browser.");

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare the status image.");

  const ink = "#0b0d0c";
  const paper = "#f3f3ed";
  const surface = "#fffef9";
  const line = "#d9d9d0";
  const muted = "#6d7069";
  const green = "#b9ff35";
  const purple = "#8b67ff";

  context.fillStyle = paper;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = green;
  context.fillRect(0, 0, 18, HEIGHT);

  context.fillStyle = "rgba(139,103,255,0.07)";
  context.beginPath();
  context.arc(1110, 70, 230, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = ink;
  roundedRect(context, 58, 48, 36, 36, 10);
  context.fill();
  context.fillStyle = green;
  roundedRect(context, 67, 57, 18, 18, 5);
  context.fill();

  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = ink;
  context.font = "900 27px ui-sans-serif, system-ui, sans-serif";
  context.fillText("CarryGo", 108, 75);
  context.fillStyle = muted;
  context.font = "800 12px ui-sans-serif, system-ui, sans-serif";
  context.letterSpacing = "2px";
  context.fillText("CAMPUS EXECUTION NETWORK", 268, 73);
  context.letterSpacing = "0px";

  context.fillStyle = surface;
  roundedRect(context, 58, 112, 1084, 378, 26);
  context.fill();
  context.strokeStyle = line;
  context.lineWidth = 1;
  context.stroke();

  context.fillStyle = purple;
  context.font = "900 13px ui-sans-serif, system-ui, sans-serif";
  context.letterSpacing = "2px";
  context.fillText("SHAREABLE DELIVERY UPDATE", 94, 154);
  context.letterSpacing = "0px";

  const label = cleanText(input.status.replace(/_/g, " "), 50).toUpperCase() || "STATUS UPDATE";
  context.font = "900 13px ui-sans-serif, system-ui, sans-serif";
  const statusWidth = Math.min(330, context.measureText(label).width + 30);
  context.fillStyle = green;
  roundedRect(context, 94, 174, statusWidth, 34, 17);
  context.fill();
  context.fillStyle = ink;
  context.fillText(label, 109, 196);

  context.fillStyle = ink;
  context.font = "900 36px ui-sans-serif, system-ui, sans-serif";
  wrapText(context, cleanText(input.title, 120) || "CarryGo delivery", 94, 260, 950, 45, 2);

  context.fillStyle = muted;
  context.font = "800 11px ui-sans-serif, system-ui, sans-serif";
  context.letterSpacing = "1.4px";
  context.fillText("PICKUP", 94, 340);
  context.fillText("DROP-OFF", 626, 340);
  context.letterSpacing = "0px";

  context.fillStyle = ink;
  context.font = "700 20px ui-sans-serif, system-ui, sans-serif";
  wrapText(context, input.pickup || "Pickup details withheld", 94, 372, 420, 27, 2);
  context.fillStyle = purple;
  context.font = "900 22px ui-sans-serif, system-ui, sans-serif";
  context.fillText("→", 555, 375);
  context.fillStyle = ink;
  context.font = "700 20px ui-sans-serif, system-ui, sans-serif";
  wrapText(context, input.destination || "Drop-off details withheld", 626, 372, 450, 27, 2);

  context.strokeStyle = line;
  context.beginPath();
  context.moveTo(94, 422);
  context.lineTo(1106, 422);
  context.stroke();

  context.fillStyle = ink;
  context.font = "900 13px ui-sans-serif, system-ui, sans-serif";
  context.fillText("VIEW THE LIVE STATUS", 94, 454);
  context.fillStyle = muted;
  context.font = "600 15px ui-sans-serif, system-ui, sans-serif";
  const safeUrl = fitUrl(context, input.url, 1000);
  context.fillText(safeUrl, 94, 475);

  context.fillStyle = ink;
  context.font = "900 14px ui-sans-serif, system-ui, sans-serif";
  context.fillText("CARRYGO", 58, 548);
  context.fillStyle = muted;
  context.font = "700 13px ui-sans-serif, system-ui, sans-serif";
  context.fillText("carrygo-chi.vercel.app", 58, 572);
  context.fillStyle = purple;
  context.fillRect(58, 588, 1084, 3);
  context.fillStyle = muted;
  context.font = "600 12px ui-sans-serif, system-ui, sans-serif";
  context.fillText("A campus-first way to get things done.", 58, 610);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Your browser could not export the status image.")), "image/png");
  });
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "carrygo-delivery-status.png";
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
  }
}
